'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { v4 as uuidv4 } from 'uuid'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface User {
  id: string;
  name: string;
  email: string;
}

export default function MultiUserChat() {
  const [user, setUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error)
      setChatError(error.message || 'An error occurred while sending the message.')
    },
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('chatUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      setShowLogin(true)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const newUser: User = { id: uuidv4(), name, email }
    setUser(newUser)
    localStorage.setItem('chatUser', JSON.stringify(newUser))
    setShowLogin(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('chatUser')
    setUser(null)
    setShowLogin(true)
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setChatError(null)
    try {
      await handleSubmit(e)
    } catch (error) {
      console.error('Error submitting message:', error)
      setChatError('Failed to send message. Please try again.')
    }
  }

  if (!user) {
    return (
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login to Chat</DialogTitle>
            <DialogDescription>
              Please enter your name and email to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Login</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Chat as {user.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start mb-4">
              <Avatar className="mr-2">
                <AvatarFallback>{message.role === 'user' ? user.name[0].toUpperCase() : 'A'}</AvatarFallback>
              </Avatar>
              <div className={`p-2 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleFormSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardFooter>
      {(chatError || error) && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{chatError || error?.message}</AlertDescription>
        </Alert>
      )}
    </Card>
  )
}