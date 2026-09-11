export interface FeedbackModalProps {
  isVisible: boolean;
  isPending: boolean;
  theme?: string;
  styles?: Record<string, string>;
  onClose: () => void;
  onSubmit: (text: string) => void;
}
