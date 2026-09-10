export interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNicknameSubmit: (nickname: string) => void;
  isPending?: boolean;
  initialNickname?: string;
}
