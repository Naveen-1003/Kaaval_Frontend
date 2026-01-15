import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { RootStackParamList, User } from '../types';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomDropdown from '../components/CustomDropdown'; // Import the new Dropdown
import { COLORS, SIZES } from '../constants/theme';

type AuthScreenProp = StackNavigationProp<RootStackParamList, 'Auth'>;

export default function AuthScreen({ navigation }: { navigation: AuthScreenProp }) {
  const { setUser, users, registerUser } = useApp(); // Get users and register function
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('investigator'); // Dropdown State
  const [loading, setLoading] = useState(false);

  // Role Options
  const roleOptions = [
    { label: 'Investigation Officer', value: 'investigator' },
    { label: 'Forensics Lab Officer', value: 'forensics' }
  ];

  const handleAuth = async () => {
    setLoading(true);
    
    setTimeout(async () => {
      setLoading(false);
      
      if (isLogin) {
        // --- LOGIN LOGIC ---
        // Search in the persisted USERS list
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (foundUser && foundUser.password === password) {
          setUser(foundUser);
          navigation.replace('Dashboard');
        } else {
          Alert.alert("Login Failed", "Invalid Email or Password");
        }
      } else {
        // --- REGISTRATION LOGIC ---
        if (!email || !password) {
           Alert.alert("Error", "Please fill all fields");
           return;
        }

        const newUser: User = { 
          id: Date.now().toString(), 
          email, 
          role: role as 'investigator' | 'forensics', 
          name: role === 'investigator' ? 'Officer (New)' : 'Dr. (New)',
          password
        };

        await registerUser(newUser); // Save to Local Memory
        setUser(newUser);
        navigation.replace('Dashboard');
      }
    }, 1000);
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Auth", "Redirecting to TN Police SSO...", [
      { text: "Cancel", style: "cancel" },
      { text: "Continue", onPress: () => {
          setUser(users[0]); 
          navigation.replace('Dashboard');
      }}
    ]);
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>ChainGuard</Text>
          <Text style={styles.subtitle}>Tamper-Proof Digital Evidence</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.formTitle}>{isLogin ? 'Officer Login' : 'New Registration'}</Text>
          
          <Text style={styles.label}>Email ID</Text>
          <TextInput 
            style={styles.input} 
            placeholder="officer@police.tn.gov" 
            placeholderTextColor={COLORS.textDim}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••" 
            placeholderTextColor={COLORS.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* New Dropdown (Only show during Sign Up) */}
          {!isLogin && (
            <CustomDropdown 
              label="Select Role"
              options={roleOptions}
              value={role}
              onSelect={setRole}
            />
          )}

          <TouchableOpacity style={styles.btnMain} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.background} /> : (
              <Text style={styles.btnText}>{isLogin ? 'Secure Login' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={20} color="white" />
            <Text style={styles.googleText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
            <Text style={styles.link}>
              {isLogin ? "New Officer? Sign Up" : "Back to Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  headerContainer: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: SIZES.h1, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  subtitle: { fontSize: SIZES.body, color: COLORS.textDim, textAlign: 'center', marginTop: 5 },
  card: { backgroundColor: COLORS.card, padding: SIZES.padding, borderRadius: SIZES.radius },
  formTitle: { fontSize: SIZES.h2, color: COLORS.text, marginBottom: 20, fontWeight: '600' },
  label: { color: COLORS.textDim, marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: COLORS.border, color: COLORS.text, padding: 15, borderRadius: 8, marginBottom: 20, fontSize: 16 },
  btnMain: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: COLORS.background, fontWeight: 'bold', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { color: COLORS.textDim, marginHorizontal: 10, fontSize: 12 },
  googleBtn: { flexDirection: 'row', backgroundColor: '#DB4437', padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchBtn: { marginTop: 20, alignItems: 'center' },
  link: { color: COLORS.textDim },
});