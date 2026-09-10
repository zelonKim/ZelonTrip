export interface NicknameModalProps {
  isVisible: boolean;
  initialValue?: string;
  isPending: boolean;
  theme: any;
  styles: any;
  onClose: () => void;
  onSave: (nickname: string) => void;
}
