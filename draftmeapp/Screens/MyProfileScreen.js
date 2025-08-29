import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../styles/theme';
import { supabase } from '../supabaseClient';

export default function MyProfileScreen({ navigation, route }) {
  const { userType, userInfo } = route.params || {};
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const esportes = ['Futebol', 'Basquete', 'Vôlei'];
  const categorias = ['Amador', 'Semi-Profissional', 'Profissional', 'Juvenil', 'Infantil'];

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    if (userType === 'player') {
      setFormData({
        nm_usuario: userInfo.nm_usuario || '',
        email_usuario: userInfo.email_usuario || '',
        tel_usuario: userInfo.tel_usuario || '',
        dt_nasc_usuario: userInfo.dt_nasc_usuario || '',
        cpf_usuario: userInfo.cpf_usuario || '',
      });
    } else {
      setFormData({
        nm_time: userInfo.nm_time || '',
        email_time: userInfo.email_time || '',
        esporte_time: userInfo.esporte_time || 'Futebol',
        categoria_time: userInfo.categoria_time || 'Amador',
        sobre_time: userInfo.sobre_time || '',
        localizacao_time: userInfo.localizacao_time || '',
        time_cnpj: userInfo.time_cnpj || '',
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (userType === 'player') {
      if (!formData.nm_usuario?.trim()) {
        Alert.alert('Erro', 'Nome é obrigatório');
        return false;
      }
      if (!formData.email_usuario?.trim() || !formData.email_usuario.includes('@')) {
        Alert.alert('Erro', 'Email válido é obrigatório');
        return false;
      }
    } else {
      if (!formData.nm_time?.trim()) {
        Alert.alert('Erro', 'Nome do time é obrigatório');
        return false;
      }
      if (!formData.email_time?.trim() || !formData.email_time.includes('@')) {
        Alert.alert('Erro', 'Email válido é obrigatório');
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let updateData = {};
      let table = '';
      let idField = '';
      let idValue = '';

      if (userType === 'player') {
        table = 'tb_usuario';
        idField = 'id_usuario';
        idValue = userInfo.id_usuario;
        updateData = {
          nm_usuario: formData.nm_usuario.trim(),
          email_usuario: formData.email_usuario.trim(),
          tel_usuario: formData.tel_usuario?.trim() || null,
        };
      } else {
        table = 'tb_time';
        idField = 'id_time';
        idValue = userInfo.id_time;
        updateData = {
          nm_time: formData.nm_time.trim(),
          email_time: formData.email_time.trim(),
          esporte_time: formData.esporte_time,
          categoria_time: formData.categoria_time,
          sobre_time: formData.sobre_time?.trim() || null,
          localizacao_time: formData.localizacao_time?.trim() || null,
        };
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq(idField, idValue);

      if (error) {
        Alert.alert('Erro', 'Erro ao atualizar perfil: ' + error.message);
        return;
      }

      Alert.alert('Sucesso!', 'Perfil atualizado com sucesso!');
      setEditing(false);

      // Atualizar os dados locais
      const updatedUserInfo = { ...userInfo, ...updateData };
      // Aqui você poderia atualizar o contexto global ou navegar de volta

    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    loadProfileData(); // Restaurar dados originais
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const renderPlayerProfile = () => (
    <ScrollView style={styles.content}>
      <Card style={styles.profileCard} variant="elevated">
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>
            {editing ? 'Editando Perfil' : formData.nm_usuario}
          </Text>
          <Badge text="Jogador" type="primary" />
        </View>

        {editing ? (
          <View style={styles.form}>
            <Input
              label="Nome Completo"
              value={formData.nm_usuario}
              onChangeText={(value) => handleInputChange('nm_usuario', value)}
              placeholder="Seu nome completo"
              leftIcon="👤"
            />

            <Input
              label="Email"
              value={formData.email_usuario}
              onChangeText={(value) => handleInputChange('email_usuario', value)}
              placeholder="seu@email.com"
              keyboardType="email-address"
              leftIcon="📧"
            />

            <Input
              label="Telefone"
              value={formData.tel_usuario}
              onChangeText={(value) => handleInputChange('tel_usuario', value)}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
              leftIcon="📱"
            />
          </View>
        ) : (
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{formData.email_usuario}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Idade:</Text>
              <Text style={styles.infoValue}>{calculateAge(formData.dt_nasc_usuario)} anos</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Telefone:</Text>
              <Text style={styles.infoValue}>{formData.tel_usuario || 'Não informado'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CPF:</Text>
              <Text style={styles.infoValue}>***.***.***-{formData.cpf_usuario?.slice(-2) || '**'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Badge 
                text={userInfo.id_time ? 'Com Time' : 'Disponível'} 
                type={userInfo.id_time ? 'warning' : 'success'} 
              />
            </View>
          </View>
        )}
      </Card>

      {/* Seção de Estatísticas (futura) */}
      <Card style={styles.statsCard} variant="elevated">
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Jogos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Gols</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Assistências</Text>
          </View>
        </View>
        <Text style={styles.comingSoon}>Em breve: sistema completo de estatísticas!</Text>
      </Card>
    </ScrollView>
  );

  const renderTeamProfile = () => (
    <ScrollView style={styles.content}>
      <Card style={styles.profileCard} variant="elevated">
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>
            {editing ? 'Editando Perfil' : formData.nm_time}
          </Text>
          <Badge text="Time" type="secondary" />
        </View>

        {editing ? (
          <View style={styles.form}>
            <Input
              label="Nome do Time"
              value={formData.nm_time}
              onChangeText={(value) => handleInputChange('nm_time', value)}
              placeholder="Nome do seu time"
              leftIcon="⚽"
            />

            <Input
              label="Email"
              value={formData.email_time}
              onChangeText={(value) => handleInputChange('email_time', value)}
              placeholder="time@email.com"
              keyboardType="email-address"
              leftIcon="📧"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Esporte:</Text>
              <Picker
                selectedValue={formData.esporte_time}
                style={styles.picker}
                onValueChange={(value) => handleInputChange('esporte_time', value)}
              >
                {esportes.map(esporte => (
                  <Picker.Item key={esporte} label={esporte} value={esporte} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Categoria:</Text>
              <Picker
                selectedValue={formData.categoria_time}
                style={styles.picker}
                onValueChange={(value) => handleInputChange('categoria_time', value)}
              >
                {categorias.map(categoria => (
                  <Picker.Item key={categoria} label={categoria} value={categoria} />
                ))}
              </Picker>
            </View>

            <Input
              label="Localização"
              value={formData.localizacao_time}
              onChangeText={(value) => handleInputChange('localizacao_time', value)}
              placeholder="Cidade, Estado"
              leftIcon="📍"
            />

            <Input
              label="Sobre o Time"
              value={formData.sobre_time}
              onChangeText={(value) => handleInputChange('sobre_time', value)}
              placeholder="Descreva seu time..."
              multiline
              numberOfLines={4}
              leftIcon="📝"
            />
          </View>
        ) : (
          <View style={styles.infoSection}>
            <View style={styles.badgeRow}>
              <Badge text={formData.esporte_time} />
              <Badge text={formData.categoria_time} type="secondary" />
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{formData.email_time}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Localização:</Text>
              <Text style={styles.infoValue}>{formData.localizacao_time || 'Não informada'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CNPJ:</Text>
              <Text style={styles.infoValue}>
                {formData.time_cnpj ? `**.***.***/**${formData.time_cnpj.slice(-2)}` : 'Não informado'}
              </Text>
            </View>

            {formData.sobre_time && (
              <View style={styles.aboutSection}>
                <Text style={styles.infoLabel}>Sobre:</Text>
                <Text style={styles.aboutText}>{formData.sobre_time}</Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </ScrollView>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <Button
              title="Voltar"
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="small"
              icon="←"
            />
            <Text style={styles.title}>Meu Perfil</Text>
            <View style={styles.headerActions}>
              {editing ? (
                <View style={styles.editActions}>
                  <Button
                    title="Cancelar"
                    onPress={handleCancel}
                    variant="ghost"
                    size="small"
                  />
                  <Button
                    title="Salvar"
                    onPress={handleSave}
                    loading={loading}
                    size="small"
                    icon="✓"
                  />
                </View>
              ) : (
                <Button
                  title="Editar"
                  onPress={() => setEditing(true)}
                  variant="ghost"
                  size="small"
                  icon="✏️"
                />
              )}
            </View>
          </View>

          {userType === 'player' ? renderPlayerProfile() : renderTeamProfile()}
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnDark,
  },
  headerActions: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  form: {
    gap: theme.spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  pickerLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  picker: {
    height: 50,
    color: theme.colors.textPrimary,
  },
  infoSection: {
    gap: theme.spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  aboutSection: {
    marginTop: theme.spacing.md,
  },
  aboutText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginTop: theme.spacing.xs,
  },
  statsCard: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  comingSoon: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

