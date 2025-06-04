'use client'

import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import MenuIcon from '@mui/icons-material/Menu'
import { useState } from 'react'

export default function Home() {
  // state to toggle between home page and main page
  const [isHomePage, setIsHomePage] = useState(true)

  // state to manage drawer open/close
  const [drawerOpen, setDrawerOpen] = useState(false)

  // state to handle current user input message
  const [message, setMessage] = useState('')

  // state to store messages for the chat interface
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi, I am your Support Agent. How can I help you today?`
    }
  ])

  // state to track current speech for voice output
  const [currentSpeech, setCurrentSpeech] = useState(null)

  // function to send message
  const sendMessage = async () => {
    if (!message.trim()) return

    if (currentSpeech) {
      speechSynthesis.cancel()
      setCurrentSpeech(null)
    }

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }
    ])

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }])
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      return reader.read().then(function processText({ done, value }) {
        if (done) return result

        const text = decoder.decode(value || new Int8Array(), { stream: true })

        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1]
          const otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            }
          ]
        })

        return reader.read().then(processText)
      })
    })
  }

  // function to speak a message
  const speakMessage = (text) => {
    if (currentSpeech) speechSynthesis.cancel()

    const speech = new SpeechSynthesisUtterance(text)
    setCurrentSpeech(speech)
    speechSynthesis.speak(speech)
  }

  // function to start a new chat
  const startNewChat = () => {
    if (currentSpeech) {
      speechSynthesis.cancel()
      setCurrentSpeech(null)
    }

    setMessage('')
    setMessages([
      {
        role: 'assistant',
        content: `Hi, I am your Support Agent. How can I help you today?`
      }
    ])
  }

  // handle enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <Box
      width='100vw'
      height='100vh'
      display='flex'
      flexDirection='column'
      sx={{
        background: 'linear-gradient(135deg, #343541, #202123)',
        fontFamily: 'Roboto, sans-serif'
      }}
    >
      {isHomePage ? (
        // home page display
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
          height='100%'
        >
          <Typography variant='h2' mb={4} sx={{ color: '#d1d5db' }}>
            Welcome to AI Customer Support
          </Typography>
          <Button
            variant='contained'
            size='large'
            onClick={() => setIsHomePage(false)}
            sx={{
              background: '#10a37f',
              color: '#fff',
              '&:hover': {
                background: '#0e8a6d'
              }
            }}
          >
            Get Started
          </Button>
        </Box>
      ) : (
        <>
          {/* menu button to open drawer */}
          <Button
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              margin: 1,
              color: '#10a37f',
              '&:hover': {
                color: '#0e8a6d'
              }
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </Button>

          {/* drawer component for navigation */}
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box
              sx={{
                width: '250px',
                background: '#333',
                color: '#fff',
                height: '100%'
              }}
              role='presentation'
              onClick={() => setDrawerOpen(false)}
              onKeyDown={() => setDrawerOpen(false)}
            >
              <List>
                <ListItem
                  sx={{
                    '&:hover': {
                      background: '#444',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <ListItemText primary='Home' onClick={() => setIsHomePage(true)} />
                </ListItem>
                <Divider sx={{ borderColor: '#555' }} />
                <ListItem
                  sx={{
                    '&:hover': {
                      background: '#444',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <ListItemText primary='New Chat' onClick={startNewChat} />
                </ListItem>
              </List>
            </Box>
          </Drawer>

          {/* main chat area */}
          <Box
            flexGrow={1}
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
            sx={{
              padding: '20px',
              overflowY: 'auto',
              background: '#444654'
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                paddingRight: '8px'
              }}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  display='flex'
                  justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
                  mb={2}
                >
                  <Box
                    sx={{
                      background: msg.role === 'assistant' ? '#343541' : '#10a37f',
                      color: msg.role === 'assistant' ? '#d1d5db' : '#fff',
                      borderRadius: 2,
                      p: 2,
                      boxShadow: 1,
                      maxWidth: '75%',
                      wordWrap: 'break-word',
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: 5
                    }}
                  >
                    <Typography variant='body1' sx={{ flexGrow: 1 }}>
                      {msg.content}
                    </Typography>
                    {msg.role === 'assistant' && (
                      <IconButton onClick={() => speakMessage(msg.content)} sx={{ ml: 2 }}>
                        <VolumeUpIcon sx={{ color: '#d1d5db' }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            <Box display='flex' mt={2}>
              <TextField
                placeholder='Send a message...'
                variant='outlined'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
                sx={{
                  borderRadius: 10,
                  background: 'rgba(52, 53, 65, 0.7)',
                  border: 'none',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none'
                    }
                  },
                  '& input': {
                    color: '#fff'
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={sendMessage}
                        sx={{
                          color: '#10a37f',
                          '&:hover': {
                            color: '#0e8a6d'
                          }
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}
