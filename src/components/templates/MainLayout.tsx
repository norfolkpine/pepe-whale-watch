import { Outlet } from 'react-router-dom';
// import { BaseContainer } from '../molecules/containers';
// import { logoColored, logoWhite } from '@/assets/images';
// import { LangSetting, ThemeSetting } from '../molecules/settings';
// import { useTheme } from '../molecules/providers';

const MainLayout = () => {
  // const { theme } = useTheme();

  return (
    <div className="min-h-screen">
      {/*
        <BaseContainer className="flex gap-3 border-b-2">
          <img src={theme == 'light' ? logoColored : logoWhite} alt="" className="me-auto w-10" />
          <LangSetting />
          <ThemeSetting />
        </BaseContainer>  */}
     
      <Outlet />
    </div>
  );
};

export default MainLayout;
