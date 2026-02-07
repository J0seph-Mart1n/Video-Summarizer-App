import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, ActivityIndicator, Modal, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from '../../constants/variables';
import Markdown from 'react-native-markdown-display';
import { Skeleton } from 'react-native-skeletons';
import StreamingText from '@/components/StreamingText';
import { insertSummary } from '@/utils/database';
import { useTheme } from '@/hooks/ThemeContext';

export default function HomeScreen() {
  const [URLmessage, setURLmessage] = useState("");
  const [summary, setSummary] = useState("This is a summary");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const { theme, toggleTheme, colors } = useTheme(); 

  const handleSummarize = async () => {
    if (!URLmessage.trim()) {
      Alert.alert("Error", "Please enter a YouTube link.");
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setSummary('');

    try {
      // 1. Send Request to Python Backend
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Matching the Pydantic model: class VideoRequest(BaseModel): url: str
        body: JSON.stringify({ url: URLmessage }), 
      });

      // 2. Parse Response
      const data = await response.json();

      // 3. Handle Backend Errors (e.g., 400 Bad Request, 500 Server Error)
      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong on the server.");
      }

      // 4. Update UI with the summary from Python
      // Matching Pydantic model: class SummaryResponse(BaseModel): summary: str
      setSummary(data.summary); 
      setSaveTitle("YouTube Summary");

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    if (!saveTitle.trim()) {
      Alert.alert("Error", "Please provide a title for your summary.");
      return;
    }

    try {
      // Save to SQLite
      await insertSummary(URLmessage, saveTitle, summary);
      
      Alert.alert("Success", "Summary saved to your Notes tab!");
      setModalVisible(false); // Close Modal
      setSaveTitle(""); // Reset Title
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save summary.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={toggleTheme} style={styles.darkmodeToggle}>
            <Ionicons 
              name={theme === 'light' ? 'moon' : 'sunny'} 
              size={25} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <Text style={[styles.titleStyle, { color: colors.text }]}>Video Summarizer</Text>
          <Text style={[styles.subtitleStyle, { color: colors.subText }]}>Summarize your Youtube Videos by providing the URL</Text>
        </View>
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg }]}>
          <TextInput
            value={URLmessage}
            onChangeText={setURLmessage}
            placeholder="Enter YouTube URL"
            placeholderTextColor="#888"
            multiline
            style={[styles.input, { color: colors.text }]}
          />
          <TouchableOpacity
            onPress={() => handleSummarize()}
            disabled={!URLmessage.trim()}
            style={[
              styles.sendButton,
            ]}
          >
          <Ionicons name="send" size={18} color="rgb(46, 41, 41)" />
        </TouchableOpacity>
        </View>
        <View style={[styles.summaryContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ScrollView>
              {summary ? (
                <StreamingText
                  text={summary}
                  speed={50}
                />
              ) : (
                isLoading ? (
                  <View>
                    <Text style={styles.generatingText}>Generating...</Text>
                    <Skeleton count={1} width={'80%'} height={20} style={{ marginBottom: 10 }} />
                    <Skeleton count={1} width={'60%'} height={20} style={{ marginBottom: 10 }} />
                    <Skeleton count={1} width={'40%'} height={20} />
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>
                    Your summary will appear here...
                  </Text>
                )
              )}
            </ScrollView>
        </View>
        {summary && !isLoading && (
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.saveIconBtn}>
            <Ionicons name="save" size={24} color='rgb(46, 41, 41)' />
          </TouchableOpacity>
        )}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Save Summary</Text>
            <Text style={[styles.modalSubtitle, { color: colors.subText }]}>Enter a title for this note:</Text>
            
            <TextInput 
              style={[styles.modalInput]}
              placeholder="Enter title"
              value={saveTitle}
              onChangeText={setSaveTitle}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn]} 
                onPress={handleSaveToDB}
              >
                <Text style={styles.confirmBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkmodeToggle: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1,
  },
  titleContainer:{
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    padding: 30,
  },
  titleStyle:{
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitleStyle:{
    fontSize: 17,
    marginTop: 10,
    textAlign: 'center',
    color: 'gray',
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    bottom: '14%',
    backgroundColor: "#191b1bff",
    borderRadius: 28,
    paddingLeft: 16,
    paddingRight: 12, // 👈 space for send button
    paddingVertical: 6,
    marginHorizontal: 15,
  },
  input: {
    flex: 1,
    maxHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    fontSize: 16,
    color: "#ffffffff",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#41b699",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    height: '55%',
    borderWidth: 1,
    borderColor: "#0b0b0bff",
    bottom: '8%',
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#000",
  },
  placeholderText: {
    fontSize: 18,
    lineHeight: 22,
    color: "#888",
    fontStyle: 'italic',
  },
  markdownStyles: {
    fontSize: 18,
  },
  generatingText:{ 
    fontSize: 16, 
    lineHeight: 22,
    color: "#888",
    fontStyle: 'italic',
    paddingBottom: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
  },
  saveIconBtn: {
    position: 'absolute',
    bottom: '0.2%',
    right: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#41b699',
    paddingVertical: 4,
    paddingHorizontal: 11,
    height: 45,
    width: 45,
    borderRadius: '40%',
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  
  // ✅ Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
  },
  confirmBtn: {
    backgroundColor: '#2a2727',
  },
  cancelBtnText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
