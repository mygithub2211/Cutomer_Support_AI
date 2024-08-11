"use client"
import { Box, Button, IconButton, TextField, Typography, InputAdornment } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import { useState } from "react"

export default function Home() {
  const [isHomePage, setIsHomePage] = useState(true) // State to toggle between home page and main page
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hi, I am your Support Agent. How can I help you today?`
  }])
  const [currentSpeech, setCurrentSpeech] = useState(null) // State to keep track of current speech

  /* FUNCTION TO SEND MESSAGE */
  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages
    
    // Cancel the current speech before sending a new message
    if (currentSpeech) {
      speechSynthesis.cancel();
      setCurrentSpeech(null);
    }

    setMessage("")
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" }
    ])

    /* FETCH RESPONSE */
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify([...messages, { role: "user", content: message }])
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ""
      return (
        reader.read().then(function processText({ done, value }) {
          if (done) {
            return (result)
          }
          const text = decoder.decode(value || new Int8Array(), { stream: true })
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1]
            let otherMessages = messages.slice(0, messages.length - 1)
            return ([
              ...otherMessages,
              {
                ...lastMessage,
                content: lastMessage.content + text
              }
            ])
          })
          return (reader.read().then(processText))
        })
      )
    })
  }

  /* FUNCTION TO SPEAK A MESSAGE */
  const speakMessage = (text) => {
    // Cancel any ongoing speech before starting new speech
    if (currentSpeech) {
      speechSynthesis.cancel();
    }
    
    const speech = new SpeechSynthesisUtterance(text);
    setCurrentSpeech(speech); // Set the current speech
    speechSynthesis.speak(speech);
  }

  /* HANDLE ENTER KEY */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      sx={{
        background: "linear-gradient(135deg, #343541, #202123)",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {isHomePage ? (
        /* HOME PAGE */
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
          <Typography 
            variant="h2" 
            mb={4}
            sx={{
              color: "#d1d5db", // Light gray color
            }}
          >
            Welcome to AI Customer Support
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => setIsHomePage(false)}
            sx={{
              background: "#10a37f", // Set a custom background color
              color: "#fff", // Text color
              "&:hover": {
                background: "#0e8a6d", // Darker shade on hover
              },
            }}
          >
            Get Started
          </Button>
        </Box>
      ) : (
        <>
          {/* MAIN CHAT AREA */}
          <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            sx={{
              padding: "20px",
              overflowY: "auto",
              background: "#444654", // Darker gray background for a clean look
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                paddingRight: "8px", // Add some padding for smooth scrolling
              }}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    msg.role === "assistant" ? "flex-start" : "flex-end"
                  }
                  mb={2}
                >
                  <Box
                    sx={{
                      background: msg.role === "assistant" ? "#343541" : "#10a37f", // Assistant and User Messages
                      color: msg.role === "assistant" ? "#d1d5db" : "#fff",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: 1,
                      maxWidth: "75%",
                      wordWrap: "break-word",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {msg.content}
                    </Typography>
                    {msg.role === "assistant" && (
                      <IconButton
                        onClick={() => speakMessage(msg.content)}
                        sx={{ ml: 2 }}
                      >
                        <VolumeUpIcon sx={{ color: "#d1d5db" }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
            <Box display="flex" mt={2}>
              <TextField
                placeholder="Send a message..."
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown} // Listen for Enter key
                sx={{
                  borderRadius: 10,
                  background: "rgba(52, 53, 65, 0.7)", // Semi-transparent background
                  border: "none", // No border
                  color: "#d1d5db", // Text color
                  width: "100%", // Take up full width
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none", // Remove the border
                    },
                    "&.Mui-focused fieldset": {
                      border: "none", // No border on focus
                    },
                  },
                  '& input': {
                    paddingLeft: "20px", // Padding inside the input field
                    color: "#d1d5db", // Input text color
                  }
                }}
                InputLabelProps={{
                  style: { color: "#d1d5db" }, // Placeholder color
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        onClick={sendMessage}
                        sx={{
                          borderRadius: 5,
                          background: "#10a37f", // Set a custom background color
                          color: "#fff", // Icon color
                          "&:hover": {
                            background: "#0e8a6d", // Darker shade on hover
                          }
                        }}
                      >
                        <SendIcon /> {/* The send Icon */}
                      </IconButton>
                    </InputAdornment>
                  ),
                  
                }}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}
