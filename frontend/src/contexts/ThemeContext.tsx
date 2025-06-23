import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');

  // Load theme from localStorage when user changes
  useEffect(() => {
    if (user?._id) {
      const savedAppSettings = localStorage.getItem(`appSettings_${user._id}`);
      if (savedAppSettings) {
        try {
          const settings = JSON.parse(savedAppSettings);
          if (settings.theme) {
            setThemeState(settings.theme);
            // Immediately apply to document
            if (settings.theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        } catch (error) {
          console.error('Error loading theme:', error);
        }
      }
    } else {
      // Reset to default when no user
      setThemeState('light');
      document.documentElement.classList.remove('dark');
    }
  }, [user?._id]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      // Force styles with inline CSS as backup
      document.documentElement.style.backgroundColor = 'rgb(17, 24, 39)';
      document.documentElement.style.color = 'rgb(243, 244, 246)';
      document.body.style.backgroundColor = 'rgb(17, 24, 39)';
      document.body.style.color = 'rgb(243, 244, 246)';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      // Remove inline styles
      document.documentElement.style.backgroundColor = '';
      document.documentElement.style.color = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Immediately apply to document and body
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      // Force styles with inline CSS as backup
      document.documentElement.style.backgroundColor = 'rgb(17, 24, 39)';
      document.documentElement.style.color = 'rgb(243, 244, 246)';
      document.body.style.backgroundColor = 'rgb(17, 24, 39)';
      document.body.style.color = 'rgb(243, 244, 246)';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      // Remove inline styles
      document.documentElement.style.backgroundColor = '';
      document.documentElement.style.color = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
    
    // Update localStorage settings
    if (user?._id) {
      const savedAppSettings = localStorage.getItem(`appSettings_${user._id}`);
      let settings = { theme: newTheme, units: 'metric', autoSave: true };
      
      if (savedAppSettings) {
        try {
          settings = { ...JSON.parse(savedAppSettings), theme: newTheme };
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
      
      localStorage.setItem(`appSettings_${user._id}`, JSON.stringify(settings));
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 