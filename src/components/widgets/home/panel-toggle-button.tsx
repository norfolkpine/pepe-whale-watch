import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PanelToggleButtonProps {
  isPanelOpen: boolean;
  onToggle: () => void;
}

export function PanelToggleButton({ isPanelOpen, onToggle }: PanelToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`absolute top-4 right-4 z-30 ${
        isPanelOpen 
          ? 'text-gray-800 hover:text-gray-600' 
          : 'text-white hover:text-black'
      }`}
      onClick={onToggle}
    >
      {isPanelOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </Button>
  )
}
