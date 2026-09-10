import React, { useState } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
} from "react-native";
import { X } from "lucide-react-native";
import { LocationAskModalProps } from "@/types/LocationAskModalProps";


export const LocationAskModal = ({
  visible,
  onClose,
  onAsk,
  isDarkMode,
  theme,
  styles,
}: LocationAskModalProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (!query.trim()) return;
    onAsk(query);
    setQuery("");
  };

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 50}
          style={styles.keyboardAvoidingWrapper}
        >
          <View
            style={[styles.modalContent, theme.modalContentBg]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, theme.textMain]}>
                🤖 여행지 맞춤 정보{" "}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={22} color={isDarkMode ? "#9CA3AF" : "#4B5563"} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalDescription, theme.textSub]}>
              AI에게 궁금한 여행지를 물어보면 맞춤 여행 정보를 답변해줘요.
            </Text>
            <TextInput
              style={[styles.modalInput, theme.modalInputBg]}
              placeholder="예: 도쿄, 뉴욕, 파리, 런던 등"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              autoFocus={true}
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity style={styles.askButton} onPress={handleSubmit}>
              <Text style={styles.askButtonText}>물어보기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};
