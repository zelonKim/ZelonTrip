export interface FeedbackModalProps {
  isVisible: boolean;
  isPending: boolean;
  theme: any;
  styles: any;
  onClose: () => void;
  onSubmit: (text: string) => void;
}
