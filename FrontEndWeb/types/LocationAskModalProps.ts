export interface LocationAskModalProps {
  visible: boolean;
  onClose: () => void;
  onAsk: (query: string) => void;
  isDarkMode?: boolean;
  theme?: string;
  styles?: Record<string, string>;
}
