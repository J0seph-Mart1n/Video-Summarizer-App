import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from '../../constants/variables';
import Markdown from 'react-native-markdown-display';
import { Skeleton } from 'react-native-skeletons';
import StreamingText from '@/components/StreamingText';

export default function HomeScreen() {
  const [URLmessage, setURLmessage] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleStyle}>Video Summarizer</Text>
          <Text style={styles.subtitleStyle}>Summarize your Youtube Videos by providing the URL</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            value={URLmessage}
            onChangeText={setURLmessage}
            placeholder="Enter YouTube URL"
            placeholderTextColor="#888"
            multiline
            style={styles.input}
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
        <View style={styles.summaryContainer}>
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
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    bottom: '12%',
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
    backgroundColor: "#41b699", // ChatGPT green
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
    bottom: '5%',
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
});
