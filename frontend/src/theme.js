import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E5BBA', // Deep blue primary
      light: '#5A7BC8',
      dark: '#1E3A8A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748B', // Slate grey
      light: '#94A3B8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC', // Very light grey background
      paper: '#FFFFFF', // Pure white for cards and papers
    },
    text: {
      primary: '#1E293B', // Dark slate for primary text
      secondary: '#64748B', // Medium slate for secondary text
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
    },
    button: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
    '0px 1px 5px rgba(0, 0, 0, 0.08), 0px 2px 2px rgba(0, 0, 0, 0.12)',
    '0px 1px 8px rgba(0, 0, 0, 0.08), 0px 3px 4px rgba(0, 0, 0, 0.12)',
    '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 4px 5px rgba(0, 0, 0, 0.12)',
    '0px 3px 5px rgba(0, 0, 0, 0.08), 0px 5px 8px rgba(0, 0, 0, 0.12)',
    '0px 3px 5px rgba(0, 0, 0, 0.08), 0px 6px 10px rgba(0, 0, 0, 0.12)',
    '0px 4px 5px rgba(0, 0, 0, 0.08), 0px 8px 10px rgba(0, 0, 0, 0.12)',
    '0px 5px 5px rgba(0, 0, 0, 0.08), 0px 10px 14px rgba(0, 0, 0, 0.12)',
    '0px 5px 6px rgba(0, 0, 0, 0.08), 0px 12px 17px rgba(0, 0, 0, 0.12)',
    '0px 6px 6px rgba(0, 0, 0, 0.08), 0px 14px 20px rgba(0, 0, 0, 0.12)',
    '0px 6px 7px rgba(0, 0, 0, 0.08), 0px 16px 24px rgba(0, 0, 0, 0.12)',
    '0px 7px 8px rgba(0, 0, 0, 0.08), 0px 18px 28px rgba(0, 0, 0, 0.12)',
    '0px 7px 9px rgba(0, 0, 0, 0.08), 0px 20px 32px rgba(0, 0, 0, 0.12)',
    '0px 8px 9px rgba(0, 0, 0, 0.08), 0px 22px 35px rgba(0, 0, 0, 0.12)',
    '0px 8px 10px rgba(0, 0, 0, 0.08), 0px 24px 38px rgba(0, 0, 0, 0.12)',
    '0px 8px 11px rgba(0, 0, 0, 0.08), 0px 26px 42px rgba(0, 0, 0, 0.12)',
    '0px 9px 11px rgba(0, 0, 0, 0.08), 0px 28px 46px rgba(0, 0, 0, 0.12)',
    '0px 9px 12px rgba(0, 0, 0, 0.08), 0px 30px 50px rgba(0, 0, 0, 0.12)',
    '0px 10px 13px rgba(0, 0, 0, 0.08), 0px 32px 54px rgba(0, 0, 0, 0.12)',
    '0px 10px 14px rgba(0, 0, 0, 0.08), 0px 34px 58px rgba(0, 0, 0, 0.12)',
    '0px 11px 14px rgba(0, 0, 0, 0.08), 0px 36px 62px rgba(0, 0, 0, 0.12)',
    '0px 11px 15px rgba(0, 0, 0, 0.08), 0px 38px 66px rgba(0, 0, 0, 0.12)',
    '0px 12px 16px rgba(0, 0, 0, 0.08), 0px 40px 70px rgba(0, 0, 0, 0.12)',
    '0px 13px 16px rgba(0, 0, 0, 0.08), 0px 42px 74px rgba(0, 0, 0, 0.12)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
          border: '1px solid #E2E8F0',
          '&:hover': {
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2E5BBA',
            },
          },
        },
      },
    },
  },
});

export default theme;