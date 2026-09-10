import { FeedbackModalProps } from "@/types/FeedbackModalProps";
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";


export const FeedbackModal = ({
  isVisible,
  isPending,
  theme,
  styles,
  onClose,
  onSubmit,
}: FeedbackModalProps) => {
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => {
    if (isVisible) {
      setFeedbackText("");
    }
  }, [isVisible]);

  const handleClose = () => {
    if (isPending) return;
    setFeedbackText("");
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(feedbackText);
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, theme.modalBg]}>
              <Text style={[styles.modalTitle, theme.textMain]}>
                💬 피드백 보내기
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  theme.textSub,
                  { textAlign: "center" },
                ]}
              >
                ZelonTrip을 이용하면서 좋았던 점이나 {"\n"}불편했던 점을 자유롭게 작성해주세요.
              </Text>

              <TextInput
                style={[styles.feedbackInput, theme.inputBg, theme.textMain]}
                placeholder="여기에 내용을 입력해 주세요 (최대 300자)"
                placeholderTextColor={theme.placeholderColor}
                value={feedbackText}
                onChangeText={setFeedbackText}
                maxLength={300}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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
                  onPress={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveButtonText}>보내기</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};