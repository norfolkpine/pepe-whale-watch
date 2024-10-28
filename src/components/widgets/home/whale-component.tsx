import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Transaction } from '@/types/types'
import { useAnimationProgress } from '@/hooks/useAnimationProgress'

interface WhaleComponentProps {
  transaction: Transaction
  onComplete: () => void
}

export const WhaleComponent = ({ transaction, onComplete }: WhaleComponentProps) => {
  const progress = useAnimationProgress(15000) // 15 seconds duration
  
  const minSize = 80
  const maxSize = 400 
  const minAmount = 100000 
  const maxAmount = 10000000 
  
  const whaleSize = Math.min(
    Math.max(
      minSize + ((transaction.amount - minAmount) / (maxAmount - minAmount)) * (maxSize - minSize),
      minSize
    ),
    maxSize
  )

  useEffect(() => {
    if (progress === 1) {
      onComplete()
    }
  }, [progress, onComplete])

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${progress * 120 - 10}%`,
        top: `${transaction.yPosition}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pepe%20whale-tCYY02MMoyjV58qO5P8g79M4JICxWM.png"
              alt="Pepe Whale"
              style={{
                width: `${whaleSize}px`,
                height: 'auto',
                transform: 'scaleX(1)',
              }}
            />
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            align="start" 
            sideOffset={5}
          >
            <p>Amount: {transaction.amount.toLocaleString()} {transaction.tokenSymbol}</p>
            <p>From: {transaction.sender.slice(0, 6)}...{transaction.sender.slice(-4)}</p>
            <p>To: {transaction.receiver.slice(0, 6)}...{transaction.receiver.slice(-4)}</p>
            <p>Token: {transaction.tokenName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
}
