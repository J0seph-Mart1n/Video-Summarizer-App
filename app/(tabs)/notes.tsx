import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, BackHandler, KeyboardAvoidingView, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState, useEffect } from 'react';
import Markdown from 'react-native-markdown-display';

export default function TabTwoScreen() {
  const [summaries, setSummaries] = useState([{id: '1', title: 'Sample Title', body: 'Sample summary body text.'}, {id: '2', title: 'Another Title', body: 'Another summary body text.'}]);
  const [modalVisible, setModalVisible] = useState(false);

  // Selected Item State
  const [selectedId, setSelectedId] = useState(null);
  const [viewTitle, setViewTitle] = useState('');
  const [viewBody, setViewBody] = useState('');

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const openModal = (item: any) => {
    setSelectedId(item.id);
    
    // Set View Data
    setViewTitle(item.title || 'Youtube Summary'); // Fallback title
    setViewBody(item.body);

    // Set Edit Data (initially same as view)
    setEditTitle(item.title || 'Youtube Summary');
    setEditBody(item.body);
    
    setIsEditing(false); // Start in "View" mode
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent} 
        onPress={() => openModal(item)}
      >
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || "Youtube Summary"}
        </Text>
        <Text style={styles.cardSummary} numberOfLines={2}>{item.body}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titleStyle}>Summaries</Text>
      <FlatList
        data={summaries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No summaries saved yet.</Text>
        }
      />
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={isEditing ? () => setIsEditing(false) : () => setIsEditing(true)}>
                <Text style={isEditing ? styles.saveText : styles.editText}>
                  {isEditing ? 'Save' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.contentContainer}>
              {/* ✅ Editable Title */}
              {isEditing ? (
                <TextInput
                  style={styles.inputTitle}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter Title"
                />
              ) : (
                <Text style={styles.viewTitle}>{viewTitle}</Text>
              )}

              {/* ✅ Editable Body / Markdown View */}
              <View style={styles.bodyContainer}>
                {isEditing ? (
                  <TextInput
                    style={styles.inputBody}
                    value={editBody}
                    onChangeText={setEditBody}
                    multiline
                    textAlignVertical="top"
                    placeholder="Edit summary..."
                  />
                ) : (
                  <ScrollView >
                    <Markdown>
                      {viewBody}
                    </Markdown>
                  </ScrollView>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  titleStyle: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  cardContent: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: 17, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  cardSummary: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 4 
  },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  closeText: { 
    color: '#007AFF', 
    fontSize: 18 
  },
  editText: { 
    color: '#007AFF', 
    fontSize: 18, 
  },
  saveText: { 
    color: '#34C759', 
    fontSize: 18, 
  },
  contentContainer: { flex: 1, padding: 20 },
  
  // View Styles
  viewTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  
  // Edit Styles
  inputTitle: { 
    fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingBottom: 5
  },
  inputBody: {
    flex: 1, fontSize: 16, lineHeight: 24, color: '#333',
    borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, padding: 10
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40, // Adds space at bottom so text isn't cut off
  },
  bodyContainer: { flex: 1 },
  markdownWrapper: { padding: 20 },
});