import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LangSetting = () => {
  const {
    i18n: { changeLanguage, language },
  } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {language}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('id')}>Bahasa Indonesia</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
