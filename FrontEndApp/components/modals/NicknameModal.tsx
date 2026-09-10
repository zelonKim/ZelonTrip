import { NicknameModalProps } from "@/types/NicknameModalProps";
import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export const NicknameModal = ({
  isVisible,
  initialValue = "",
  isPending,
  theme,
  styles,
  onClose,
  onSave,
}: NicknameModalProps) => {
  const [nickname, setNickname] = useState(initialValue);

  useEffect(() => {
    if (isVisible) {
      setNickname(initialValue);
    }
  }, [isVisible, initialValue]);

  const handleClose = () => {
    if (isPending) return;
    setNickname(initialValue);
    onClose();
  };

  const handleSave = () => {
    onSave(nickname);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, theme.modalBg]}>
          <Text style={[styles.modalTitle, theme.textMain]}>닉네임 설정</Text>
          <Text style={[styles.modalSubtitle, theme.textSub]}>
            새로운 닉네임을 입력해 주세요.
          </Text>

          <TextInput
            style={[styles.nicknameInput, theme.inputBg, theme.textMain]}
            placeholder="닉네임 입력"
            placeholderTextColor={theme.placeholderColor}
            value={nickname}
            onChangeText={setNickname}
            maxLength={15}
            autoFocus
          />

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.modalCancelButton,
                theme.cancelBtnBg,
              ]}
              onPress={handleClose}
              disabled={isPending}
            >
              <Text style={[styles.modalCancelButtonText, theme.textMain]}>
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton]}
              onPress={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveButtonText}>저장</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
