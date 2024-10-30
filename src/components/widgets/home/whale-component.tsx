import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Transaction } from '@/types/types'

interface WhaleComponentProps {
  transaction: Transaction
  onComplete: () => void
}

export const WhaleComponent = ({ transaction, onComplete }: WhaleComponentProps) => {
  
  const minSize = 80
  const maxSize = 400 
  const minUsdAmount = 1000 
  const maxUsdAmount = 270000 
  const duration = 20
  
  const whaleSize = Math.min(
    Math.max(
      minSize + ((transaction.usdValue - minUsdAmount) / (maxUsdAmount - minUsdAmount)) * (maxSize - minSize),
      minSize
    ),
    maxSize
  )

  const initialX = `-${whaleSize + 50}px` 
  const finalX = `calc(100vw + ${whaleSize + 50}px)` 

  return (
    <motion.div
      initial={{ x: initialX }}
      animate={{ x: finalX }}
      transition={{
        duration: duration,
        ease: "linear",
        repeat: 0
      }}
      style={{
        position: 'absolute',
        top: `${transaction.yPosition}%`,
        transform: 'translate(0, -50%)', 
      }}
      onAnimationComplete={onComplete}
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
