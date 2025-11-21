"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Instagram, Send, Loader2 } from "lucide-react"

interface ContactModalProps {
    isOpen: boolean
    onClose: () => void
    selectedPackage: string
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, selectedPackage }) => {
    const [contactInfo, setContactInfo] = useState('')
    const [message, setMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSending(true)

        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contactInfo,
                    message,
                    selectedPackage,
                }),
            })

            if (response.ok) {
                setIsSuccess(true)
                setTimeout(() => {
                    onClose()
                    setIsSuccess(false)
                    setContactInfo('')
                    setMessage('')
                }, 2000)
            } else {
                alert('Failed to send message. Please try again.')
            }
        } catch (error) {
            console.error('Error sending email:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setIsSending(false)
        }
    }

    const handleInstagramClick = () => {
        window.open('https://instagram.com/ripplemedia.us', '_blank')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-md border-gray-200">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-neutral-900">Get in Touch</DialogTitle>
                    <DialogDescription className="text-neutral-600">
                        You selected <strong>{selectedPackage}</strong>. Fill out the form below or message me on Instagram.
                    </DialogDescription>
                </DialogHeader>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Send className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900">Message Sent!</h3>
                        <p className="text-neutral-600">I&apos;ll get back to you shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSendEmail} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contact" className="text-neutral-700">Email or Phone</Label>
                            <Input
                                id="contact"
                                placeholder="your@email.com or +1234567890"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                                required
                                className="bg-white border-gray-200 focus:border-primary focus:ring-primary"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message" className="text-neutral-700">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Tell me about your project..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="bg-white border-gray-200 focus:border-primary focus:ring-primary min-h-[100px]"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isSending}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Email
                                </>
                            )}
                        </Button>

                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-gray-300" />
                            <span className="text-xs uppercase text-neutral-500 font-medium">Or</span>
                            <div className="h-px flex-1 bg-gray-300" />
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleInstagramClick}
                            className="w-full bg-white border-gray-300 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        >
                            <Instagram className="w-4 h-4 mr-2" />
                            Message on Instagram
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ContactModal
