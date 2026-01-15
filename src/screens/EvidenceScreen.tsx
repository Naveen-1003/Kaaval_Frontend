import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { RootStackParamList, Evidence } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, SIZES } from '../constants/theme';

type Props = {
  route: RouteProp<RootStackParamList, 'Evidence'>;
  navigation: StackNavigationProp<RootStackParamList, 'Evidence'>;
};

export default function EvidenceScreen({ route, navigation }: Props) {
  const { caseId } = route.params;
  const { cases, updateCaseEvidence } = useApp(); // Use the new update function
  const activeCase = cases.find(c => c.caseId === caseId);

  const pickImage = async (useCamera = false) => {
    let result = useCamera 
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (!result.canceled && result.assets) {
      analyzeDocument(result.assets[0]);
    }
  };

  const analyzeDocument = (asset: any) => {
    Alert.alert("Analyzing with AI", "Verifying document authenticity...");
    setTimeout(() => {
      const newEvidence = {
        type: 'image', 
        uri: asset.uri, 
        hash: 'Qm' + Date.now(), // Simulating IPFS Hash
        timestamp: new Date().toISOString(),
        name: 'New Evidence Upload'
      };
      
      // Save to Global State & Persistence
      updateCaseEvidence(caseId, newEvidence);
      
    }, 1500);
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Navigation Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Blockchain Record Card */}
        <View style={styles.ledgerCard}>
          <View style={styles.ledgerHeader}>
             <Ionicons name="cube-outline" size={16} color={COLORS.primary} />
             <Text style={styles.ledgerTitle}>IMMUTABLE LEDGER RECORD</Text>
          </View>
          <Text style={styles.hashText}>{activeCase?.blockchainHash}</Text>
          <View style={styles.ledgerMeta}>
             <View>
               <Text style={styles.metaLabel}>Timestamp</Text>
               <Text style={styles.metaVal}>{new Date(activeCase?.timestamp!).toLocaleString()}</Text>
             </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]} onPress={() => pickImage(false)}>
            <Ionicons name="cloud-upload" size={20} color="white" />
            <Text style={styles.actionText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* --- FLOWCHART UI --- */}
        <Text style={styles.sectionTitle}>Chain of Custody (Flow)</Text>
        
        <View style={styles.flowContainer}>
          {/* 1. Case Opened Node */}
          <View style={styles.flowNode}>
            <View style={[styles.nodeIcon, { backgroundColor: COLORS.success }]}>
               <Ionicons name="folder-open" size={20} color="black" />
            </View>
            <View style={styles.nodeContent}>
              <Text style={styles.nodeTitle}>Case Opened</Text>
              <Text style={styles.nodeTime}>{new Date(activeCase?.timestamp!).toLocaleString()}</Text>
              <Text style={styles.nodeDesc}>Genesis Block created by {activeCase?.officer}</Text>
            </View>
          </View>

          {/* Vertical Connector Line */}
          <View style={styles.connectorLine} />

          {/* 2. Evidence Nodes */}
          {activeCase?.evidence?.map((item: any, index: number) => (
            <React.Fragment key={index}>
              <View style={styles.flowNode}>
                <View style={styles.nodeIcon}>
                  <Ionicons name="image" size={20} color="white" />
                </View>
                <View style={styles.nodeContent}>
                  <Text style={styles.nodeTitle}>Evidence Added</Text>
                  <Text style={styles.nodeTime}>{new Date(item.timestamp).toLocaleString()}</Text>
                  <Text style={styles.nodeHash}>IPFS: {item.hash.substring(0, 15)}...</Text>
                  <Image source={{ uri: item.uri }} style={styles.nodeImage} />
                </View>
              </View>
              {/* Add connector only if it's not the last item */}
              {index < activeCase.evidence.length - 1 && <View style={styles.connectorLine} />}
            </React.Fragment>
          ))}
          
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  ledgerCard: { backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 15, borderRadius: SIZES.radius, borderColor: 'rgba(56, 189, 248, 0.3)', borderWidth: 1, marginBottom: 25 },
  ledgerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  ledgerTitle: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  hashText: { color: COLORS.textDim, fontFamily: 'Courier', fontSize: 11, marginBottom: 15 },
  ledgerMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { color: COLORS.textDim, fontSize: 10, textTransform: 'uppercase' },
  metaVal: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  actionBtn: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: SIZES.radius, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  actionText: { color: COLORS.background, fontWeight: 'bold' },
  
  // Flowchart Styles
  flowContainer: { paddingLeft: 10 },
  flowNode: { flexDirection: 'row', gap: 15 },
  nodeIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  nodeContent: { flex: 1, backgroundColor: COLORS.card, padding: 15, borderRadius: 12, marginBottom: 5 },
  nodeTitle: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  nodeTime: { color: COLORS.textDim, fontSize: 12, marginBottom: 5 },
  nodeDesc: { color: COLORS.text, fontSize: 12 },
  nodeHash: { color: COLORS.secondary, fontFamily: 'Courier', fontSize: 10, marginBottom: 8 },
  nodeImage: { width: '100%', height: 120, borderRadius: 8, marginTop: 5, backgroundColor: COLORS.background },
  connectorLine: { width: 2, backgroundColor: COLORS.border, height: 30, marginLeft: 19, marginVertical: -5 } // Connects the dots
});