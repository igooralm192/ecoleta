import React, { useEffect, useState } from 'react'
import { Feather as Icon } from '@expo/vector-icons'
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'

// import * as Select from '@react-native-picker/picker'
import RNPickerSelect from 'react-native-picker-select'
import { ibgeApi } from '../../services/api'

interface IBGEUFResponse {
  sigla: string
}

interface IBGECityResponse {
  nome: string
}

const Home = () => {
  const navigation = useNavigation()

  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [selectedUf, setSelectedUf] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  function handleNavigateToPoints() {
    navigation.navigate('Points', {
      uf: selectedUf,
      city: selectedCity
    })
  }

  function handleSelectUf(value: string) {
    setSelectedUf(value)
  }

  function handleSelectCity(value: string) {
    setSelectedCity(value)
  }

  useEffect(() => {
    ibgeApi.get<IBGEUFResponse[]>('estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla).sort((a, b) => a.localeCompare(b))

      setUfs(ufInitials)
    })
  }, [])

  useEffect(() => {
    if (selectedUf === '') return

    ibgeApi.get<IBGECityResponse[]>(`estados/${selectedUf}/municipios`).then(response => {
      setCities(response.data.map(city => city.nome).sort((a, b) => a.localeCompare(b)))
    })
  }, [selectedUf])

  return (
    <ImageBackground
      source={require('../../assets/home-background.png')}
      style={styles.container}
      imageStyle={{ width: 174, height: 268 }}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />

        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente. </Text>
      </View>

      <View style={styles.footer}>
        <RNPickerSelect
          placeholder={{
            label: 'Selecione uma UF',
            value: '',
            color: '#9EA0A4'
          }}
          onValueChange={(value) => handleSelectUf(value)}
          items={ufs.map(uf => ({ value: uf, label: uf }))}
          value={selectedUf}
          style={{
            ...pickerSelectStyles,
            iconContainer: {
              top: 15,
              right: 12,
            },
          }}
          Icon={() => {
            return (
              <Icon name='chevron-down' size={20} color="#9EA0A4" />
            );
          }}
        />
        <View style={{paddingVertical: 5}} />
        <RNPickerSelect
          placeholder={{
            label: 'Selecione uma cidade',
            value: '',
            color: '#9EA0A4'
          }}
          onValueChange={(value) => handleSelectCity(value)}
          items={cities.map(city => ({ value: city, label: city }))}
          value={selectedCity}
          style={{
            ...pickerSelectStyles,
            iconContainer: {
              top: 15,
              right: 12,
            },
          }}
          Icon={() => {
            return (
              <Icon name='chevron-down' size={20} color="#9EA0A4" />
            );
          }}
        />
        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name='arrow-right' color='#FFF' size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderRadius: 16,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#FFF' // to ensure the text is never behind the icon
  },
});

export default Home