// DraftMe Theme - Baseado no design do site oficial
export const theme = {
  colors: {
    // Cores principais baseadas no site
    primary: '#0D1936',        // Cor primária do site
    primaryLight: '#1A2B4A',   // Variação mais clara
    primaryDark: '#081122',    // Variação mais escura
    
    secondary: '#535354',      // Cor secundária do site
    secondaryLight: '#6B6B6C',
    secondaryDark: '#3B3B3C',
    
    // Cores de fundo
    background: '#EFEFEF',     // Fundo principal do site
    backgroundCard: '#FFFFFF', // Fundo dos cards
    backgroundInput: '#ECF0F1', // Fundo dos inputs (do site)
    
    // Cores de texto
    textPrimary: '#0D1936',    // Texto principal
    textSecondary: '#535354',  // Texto secundário
    textOnPrimary: '#FFFFFF',  // Texto sobre cor primária
    textOnDark: '#FFFFFF',     // Texto sobre fundo escuro
    textOnLight: '#0D1936',    // Texto sobre fundo claro
    
    // Cores de status
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
    
    // Cores neutras
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#F8F9FA',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    gray600: '#6C757D',
    gray700: '#495057',
    gray800: '#343A40',
    gray900: '#212529',
    
    // Cores de borda
    border: '#E3E4E6',         // Cor das bordas do site
    borderFocus: '#0D1936',    // Borda em foco
    
    // Gradientes baseados na cor primária
    gradientStart: '#0D1936',
    gradientMiddle: '#1A2B4A',
    gradientEnd: '#2C3E50',
    
    // Sombras
    shadow: 'rgba(13, 25, 54, 0.1)',  // Sombra baseada na cor primária
    shadowDark: 'rgba(13, 25, 54, 0.2)',
  },
  
  typography: {
    fontFamily: {
      primary: 'System', // No React Native usamos System, mas simula Poppins
      secondary: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,    // Tamanho dos títulos do site
      '4xl': 32,
      '5xl': 36,
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 15,      // Baseado no site (15px)
    '2xl': 20,
    '3xl': 30,   // Para botões arredondados
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: 'rgba(13, 25, 54, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    base: {
      shadowColor: 'rgba(13, 25, 54, 0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: 'rgba(13, 25, 54, 0.15)',  // Sombra do site
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 15,
      elevation: 8,
    },
    xl: {
      shadowColor: 'rgba(13, 25, 54, 0.2)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 12,
    },
  },
  
  // Componentes específicos baseados no site
  components: {
    button: {
      height: 50,           // Altura dos botões do site
      borderRadius: 30,     // Botões bem arredondados
      paddingHorizontal: 50, // Padding dos botões do site
    },
    input: {
      height: 55,           // Altura dos inputs do site
      borderRadius: 30,     // Inputs arredondados
      paddingHorizontal: 20,
      borderWidth: 1,
    },
    card: {
      borderRadius: 15,     // Bordas dos cards do site
      padding: 20,
    },
    wrapper: {
      borderRadius: 15,     // Container principal
      padding: 32,
    },
  },
};

// Cores específicas por esporte (mantendo as originais mas ajustadas)
export const sportColors = {
  'Futebol': '#27AE60',
  'Basquete': '#E67E22', 
  'Vôlei': '#3498DB',
  'Todos': theme.colors.primary,
};

// Cores por categoria (baseadas no tema)
export const categoryColors = {
  'Amador': '#95A5A6',
  'Semi-Profissional': '#F39C12',
  'Profissional': '#E74C3C',
  'Juvenil': '#9B59B6',
  'Infantil': '#1ABC9C',
};

// Cores por status
export const statusColors = {
  'Pendente': '#F39C12',
  'Aceito': '#27AE60', 
  'Rejeitado': '#E74C3C',
  'Disponível': '#27AE60',
  'Com Time': '#F39C12',
};

export default theme;

