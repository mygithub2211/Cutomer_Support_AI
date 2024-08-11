"use client"
import { Box, Button, IconButton, TextField, Typography, InputAdornment, Drawer, List, ListItem, ListItemText, Divider } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import MenuIcon from "@mui/icons-material/Menu"
import { useState } from "react"

export default function Home() {
  // STATE TO TOGGLE BETWEEN HOME PAGE AND MAIN PAGE
  const [isHomePage, setIsHomePage] = useState(true) 
  // STATE TO MANAGE DRAWER OPEN/CLOSE
  const [drawerOpen, setDrawerOpen] = useState(false) 
  // STATE TO HANDLE CURRENT USER INPUT MESSAGE
  const [message, setMessage] = useState("") 
  // STATE TO STORE MESSAGES FOR THE CHAT INTERFACE
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hi, I am your Support Agent. How can I help you today?`
  }])
  // STATE TO TRACK CURRENT SPEECH FOR VOICE OUTPUT
  const [currentSpeech, setCurrentSpeech] = useState(null)

  /* FUNCTION TO SEND MESSAGE */
  const sendMessage = async () => {
    if (!message.trim()) return; // PREVENT SENDING EMPTY MESSAGES
    
    // CANCEL THE CURRENT SPEECH BEFORE SENDING A NEW MESSAGE
    if (currentSpeech) {
      speechSynthesis.cancel();
      setCurrentSpeech(null);
    }

    // CLEAR THE INPUT FIELD AND ADD USER AND ASSISTANT MESSAGES TO THE STATE
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
    // CANCEL ANY ONGOING SPEECH BEFORE STARTING NEW SPEECH
    if (currentSpeech) {
      speechSynthesis.cancel();
    }
    
    // INITIALIZE AND START SPEAKING THE MESSAGE
    const speech = new SpeechSynthesisUtterance(text);
    setCurrentSpeech(speech); // SET THE CURRENT SPEECH
    speechSynthesis.speak(speech);
  }

  /* FUNCTION TO START A NEW CHAT */
  const startNewChat = () => {
    // CANCEL ANY ONGOING SPEECH WHEN STARTING A NEW CHAT
    if (currentSpeech) {
      speechSynthesis.cancel();
      setCurrentSpeech(null);
    }

    // RESET THE MESSAGE AND MESSAGES STATES
    setMessage("");
    setMessages([{
      role: "assistant",
      content: `Hi, I am your Support Agent. How can I help you today?`
    }]);
  }

  /* HANDLE ENTER KEY */
  const handleKeyDown = (e) => {
    // IF "ENTER" KEY IS PRESSED, SEND THE MESSAGE
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
        /* HOME PAGE DISPLAY */
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
          <Typography 
            variant="h2" 
            mb={4}
            sx={{
              color: "#d1d5db", // LIGHT GRAY COLOR
            }}
          >
            Welcome to AI Customer Support
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => setIsHomePage(false)}
            sx={{
              background: "#10a37f", // CUSTOM BACKGROUND COLOR
              color: "#fff", // TEXT COLOR
              "&:hover": {
                background: "#0e8a6d", // DARKER SHADE ON HOVER
              },
            }}
          >
            Get Started
          </Button>
        </Box>
      ) : (
        <>
          {/* MENU BUTTON TO OPEN DRAWER */}
          <Button
            sx={{ 
              position: "absolute", 
              left: 0, 
              top: 0, 
              margin: 1,
              color: "#10a37f", // TEXT COLOR
              "&:hover": {
                color: "#0e8a6d" // DARKER SHADE ON HOVER
              }
            }} 
            onClick={() => setDrawerOpen(true)}
            >
            <MenuIcon />
          </Button>
          
          {/* DRAWER COMPONENT FOR NAVIGATION */}
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box
              sx={{
                width: "250px",
                background: "#333", // DARK BACKGROUND COLOR FOR THE DRAWER
                color: "#fff", // WHITE TEXT COLOR FOR CONTRAST
                height: "100%",
              }}
              role="presentation"
              onClick={() => setDrawerOpen(false)}
              onKeyDown={() => setDrawerOpen(false)}
            >
              <List>
                <ListItem
                  sx={{
                    "&:hover": {
                      background: "#444", // SLIGHTLY LIGHTER ON HOVER
                      cursor: "pointer", // POINTER CURSOR ON HOVER
                    },
                  }}
                >
                  <ListItemText primary="Home" onClick={() => setIsHomePage(true)} />
                </ListItem>
                <Divider sx={{ borderColor: "#555" }} /> {/* CUSTOM COLOR FOR THE DIVIDER */}
                <ListItem
                  sx={{
                    "&:hover": {
                      background: "#444", // SLIGHTLY LIGHTER ON HOVER
                      cursor: "pointer", // POINTER CURSOR ON HOVER
                    },
                  }}
                >
                  <ListItemText primary="New Chat" onClick={startNewChat} />
                </ListItem>
              </List>
            </Box>
          </Drawer>

          {/* MAIN CHAT AREA */}
          <Box
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            sx={{
              padding: "20px",
              overflowY: "auto",
              background: "#444654", // DARKER GRAY BACKGROUND FOR A CLEAN LOOK
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                paddingRight: "8px", // ADD SOME PADDING FOR SMOOTH SCROLLING
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
                      background: msg.role === "assistant" ? "#343541" : "#10a37f", // ASSISTANT AND USER MESSAGES COLORS
                      color: msg.role === "assistant" ? "#d1d5db" : "#fff",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: 1,
                      maxWidth: "75%",
                      wordWrap: "break-word",
                      display: "flex",
                      alignItems: "center",
                      marginTop: 5
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
                onKeyDown={handleKeyDown} // LISTEN FOR ENTER KEY
                fullWidth
                sx={{
                  borderRadius: 10,
                  background: "rgba(52, 53, 65, 0.7)", // SEMI-TRANSPARENT BACKGROUND
                  border: "none", // NO BORDER
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none", // REMOVE BORDER FROM THE FIELDSET
                    },
                  },
                  "& input": {
                    color: "#fff", // WHITE TEXT COLOR
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={sendMessage} // SEND MESSAGE WHEN ICON IS CLICKED
                        sx={{
                          color: "#10a37f", // ICON COLOR
                          "&:hover": {
                            color: "#0e8a6d", // DARKER ICON COLOR ON HOVER
                          },
                        }}
                      >
                        <SendIcon />
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
