import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, Text, ScrollView, Alert, ToastAndroid, TouchableOpacity } from 'react-native';
import { Button } from '@rneui/themed';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ActionSheet from 'react-native-actions-sheet';

import { YoutubeTranscript } from 'youtube-transcript';
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


export default function HomeScreen({ onLogout }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadedText, setDownloadedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const actionSheetRef = useRef(null);
  const [summaryText, setSummaryText] = useState('');
  const navigation = useNavigation();

  const getVideoTitle = async (videoId) => {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const data = await response.json();
      return data.title || 'Título no disponible';
    } catch (error) {
      console.error('Error al obtener título:', error);
      return 'Título no disponible';
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };


    const handleGenerateSummary = async () => {
    actionSheetRef.current?.hide();
    if (!downloadedText) {
      Alert.alert("Error", "No hay texto para resumir");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://xtwpnwclvxaujjdlnlxr.supabase.co/functions/v1/summarize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3Bud2NsdnhhdWpqZGxubHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mjg3MTYsImV4cCI6MjA2NDIwNDcxNn0.aj2gd2H6fxYKPkslp266N2jHfzVbUKmpJWEULs2MXYk`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subtitleId: extractVideoId(videoUrl) || 'unknown',
          text: downloadedText
        })
      });

      const data = await response.json();
      if (data.summary) {
        setSummaryText(data.summary);
        console.log('Resumen generado:', data.summary);
        ToastAndroid.show('Resumen generado con IA', ToastAndroid.SHORT);
      } else {
        throw new Error('No se recibió resumen');
      }
    } catch (error) {
      console.error('Error al generar resumen:', error);
      Alert.alert("Error", "No se pudo generar el resumen");
    } finally {
      setIsLoading(false);
    }
  };

const handleShareSummaryPDF = async () => {
  actionSheetRef.current?.hide();
  if (!summaryText) {
    Alert.alert("Error", "Primero genera un resumen");
    return;
  }

  setIsLoading(true);
  
  try {
    const videoId = extractVideoId(videoUrl);
    const title = videoTitle || await getVideoTitle(videoId);
    const htmlContent = generateHTML(summaryText, `Resumen: ${title}`);
    const fileName = `resumen_${title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    const path = `${FileSystem.documentDirectory}${fileName}`;

    // 1. Primero generar el PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      width: 612,   // Ancho estándar para papel carta (8.5 pulgadas en puntos)
      height: 792,   // Alto estándar para papel carta (11 pulgadas en puntos)
      base64: false
    });

    // 2. Mover el archivo generado a una ubicación permanente
    const newPath = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.moveAsync({
      from: uri,
      to: newPath
    });

    // 3. Verificar que el archivo existe
    const fileInfo = await FileSystem.getInfoAsync(newPath);
    if (!fileInfo.exists) {
      throw new Error('El archivo PDF no se creó correctamente');
    }

    // 4. Compartir el archivo
    await Sharing.shareAsync(newPath, {
      mimeType: 'application/pdf',
      dialogTitle: `Compartir Resumen: ${title} (PDF)`,
      UTI: 'com.adobe.pdf'
    });

  } catch (error) {
    console.error('Error al compartir resumen PDF:', error);
    Alert.alert("Error", "No se pudo compartir el resumen PDF: " + error.message);
  } finally {
    setIsLoading(false);
  }
};

 const handleReloadHome = () => {
    setVideoUrl('');
    setDownloadedText('');
    setSummaryText('');
    setVideoTitle('');
    setShowActions(false);
  };

  // Función para navegar a la lista de subtítulos
  const handleNavigateToList = () => {
    navigation.navigate('ListSubtitlesScreen');
  };


  const handleLoadSubtitles = async () => {
    if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
      Alert.alert("URL inválida", "Introduce una URL válida de YouTube");
      return;
    }

    setIsLoading(true);
    setDownloadedText('');
    setShowActions(false);
    setVideoTitle('');

    try {
      const videoId = extractVideoId(videoUrl);
      const [transcript, title] = await Promise.all([
        YoutubeTranscript.fetchTranscript(videoUrl),
        getVideoTitle(videoId)
      ]);
      
      console.log('Título del video:', title);
      const soloTexto = transcript.map(item => item.text).join(' ');
      setDownloadedText(soloTexto);
      setVideoTitle(title);
      setShowActions(true);
    } catch (error) {
      console.error('Error al obtener subtítulos:', error);
      Alert.alert("Error", "No se pudieron obtener los subtítulos. Asegúrate que el video tenga subtítulos disponibles.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(downloadedText);
    ToastAndroid.show('Texto copiado al portapapeles', ToastAndroid.SHORT);
    actionSheetRef.current?.hide();
  };

  const generateHTML = (content, title = 'Subtítulos de YouTube') => {
    // Dividir el texto en párrafos basados en puntos o saltos de línea
    const paragraphs = content.split(/(?<=[.!?])\s+/).filter(p => p.trim().length > 0);
    
    const escapedContent = paragraphs
      .map(paragraph => `<p style="margin-bottom: 12px;">${paragraph
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")}</p>`)
      .join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .title {
      font-size: 1.5em;
      font-weight: bold;
      margin-bottom: 0.5em;
      color: #333;
    }
    .subtitle {
      color: #666;
      font-size: 1em;
      margin-bottom: 1em;
    }
    .content {
      line-height: 1.8;
      text-align: justify;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 0.8em;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${title}</div>
  </div>
  
  <div class="content">
    ${escapedContent}
  </div>
  
  <div class="footer">
    Generado el ${new Date().toLocaleDateString()} - VideoNotes App
  </div>
</body>
</html>`;
  };

  const handleSharePDF = async () => {
    actionSheetRef.current?.hide();
    try {
      if (!downloadedText) {
        Alert.alert("Error", "No hay texto para compartir");
        return;
      }

      const videoId = extractVideoId(videoUrl);
      const title = await getVideoTitle(videoId);
      const htmlContent = generateHTML(downloadedText, title);
      const fileName = `subtitulos_${title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      const path = `${FileSystem.documentDirectory}${fileName}`;


    await FileSystem.writeAsStringAsync(path, htmlContent);
     
      await Sharing.shareAsync(path, {
        mimeType: 'application/pdf',
        dialogTitle: `Compartir: ${title} (PDF)`,
        UTI: 'com.adobe.pdf'
      });

    } catch (error) {
      console.error('Error al compartir PDF:', error);
      Alert.alert("Error", "No se pudo compartir el PDF");
    }
  };
  
  const handleShareHTML = async () => {
    actionSheetRef.current?.hide();
    try {
      if (!downloadedText) {
        Alert.alert("Error", "No hay texto para compartir");
        return;
      }

      const videoId = extractVideoId(videoUrl);
      const title = videoTitle || await getVideoTitle(videoId);
      const htmlContent = generateHTML(downloadedText, title);
      const fileName = `subtitulos_${title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.html`;
      const path = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(path, htmlContent);
      
      await Sharing.shareAsync(path, {
        mimeType: 'text/html',
        dialogTitle: `Compartir HTML: ${title}`,
        UTI: 'public.html'
      });
    } catch (error) {
      console.error('Error al compartir HTML:', error);
      Alert.alert("Error", "No se pudo compartir el archivo HTML");
    }
  };

  const handleDelete = () => {
    setDownloadedText('');
    setShowActions(false);
    setVideoTitle('');
    ToastAndroid.show('Texto eliminado', ToastAndroid.SHORT);
    actionSheetRef.current?.hide();
  };

  const showActionSheet = () => {
    actionSheetRef.current?.show();
  };

  return (
    <View style={styles.container}>
  <View style={styles.header}>
        <Button 
          onPress={handleNavigateToList} 
          buttonStyle={styles.headerButton}
          icon={{
            name: 'list',
            type: 'material',
            color: '#7659EF',
            size: 24,
          }}
        />
        <Button 
          onPress={handleReloadHome} 
          buttonStyle={styles.headerButton}
          icon={{
            name: 'home',
            type: 'material',
            color: '#7659EF',
            size: 24,
          }}
        />
   
        <Button 
          onPress={onLogout} 
          buttonStyle={styles.headerButton}
          icon={{
            name: 'logout',
            type: 'material',
            color: '#7659EF',
            size: 24,
          }}
        />
      </View>

      <Text style={styles.title}>VideoNotes</Text>
      <Text style={styles.subtitle}>
        Para obtener el texto de un video de YouTube, pega la URL del video aquí:
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Pega la URL del video de YouTube"
          value={videoUrl}
          onChangeText={setVideoUrl}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {videoUrl ? (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => setVideoUrl('')}
          >
            <MaterialIcons name="clear" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <Button
        title={isLoading ? "Procesando..." : "Obtener subtítulos"}
        buttonStyle={[styles.primaryButton, !videoUrl && styles.disabledButton]}
        disabled={isLoading || !videoUrl}
        onPress={handleLoadSubtitles}
        loading={isLoading}
        icon={{
          name: 'youtube',
          type: 'font-awesome',
          color: videoUrl ? 'white' : '#999',
          size: 20,
        }}
        iconRight
      />

      {videoTitle ? (
        <Text style={styles.videoTitle}>{videoTitle}</Text>
      ) : null}

      {showActions && downloadedText ? (
        <>
          <ScrollView style={styles.textContainer} keyboardShouldPersistTaps="handled">
            <Text style={styles.text}>{downloadedText}</Text>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.actionTrigger} 
            onPress={showActionSheet}
          >
            <Text style={styles.actionTriggerText}>Opciones</Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#7659EF" />
          </TouchableOpacity>
        </>
      ) : null}


      <ActionSheet ref={actionSheetRef} containerStyle={styles.actionSheet}>
        <View style={styles.actionSheetContent}>
         {/* Opción para exportar resumen PDF (sólo visible si hay resumen) */}
        {summaryText ? (
          <TouchableOpacity 
            style={[styles.actionItem, {borderLeftColor: '#F4B400'}]} 
            onPress={handleShareSummaryPDF}
          >
            <MaterialIcons name="picture-as-pdf" size={24} color="#F4B400" />
            <Text style={styles.actionItemText}>Exportar Resumen con IA PDF</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity 
          style={[styles.actionItem, {borderLeftColor: '#9C27B0'}]} 
          onPress={handleGenerateSummary}
        >

          <MaterialIcons name="auto-awesome" size={24} color="#9C27B0" />
          <Text style={styles.actionItemText}>Resumen con IA</Text>
        </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, {borderLeftColor: '#F4B400'}]} 
            onPress={handleSharePDF}
          >
            <MaterialIcons name="picture-as-pdf" size={24} color="#F4B400" />
            <Text style={styles.actionItemText}>Exportar PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionItem, {borderLeftColor: '#7659EF'}]} 
            onPress={handleShareHTML}
          >
            <Feather name="share-2" size={24} color="#7659EF" />
            <Text style={styles.actionItemText}>Exportar HTML</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionItem, {borderLeftColor: '#34A853'}]} 
            onPress={handleCopy}
          >
            <MaterialIcons name="content-copy" size={24} color="#34A853" />
            <Text style={styles.actionItemText}>Copiar texto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionItem, {borderLeftColor: '#EA4335'}]} 
            onPress={handleDelete}
          >
            <AntDesign name="delete" size={24} color="#EA4335" />
            <Text style={styles.actionItemText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#7659EF'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555'
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 10
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    paddingRight: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 20,
    borderRadius: 10,
  },
  headerButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
   summaryContainer: {
    marginVertical: 10,
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f0f8ff'
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32'
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 5,
  },
  primaryButton: {
    backgroundColor: '#7659EF',
    borderRadius: 8,
    paddingVertical: 15,
    marginBottom: 20
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  actionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  actionTriggerText: {
    color: '#7659EF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  actionSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  actionSheetContent: {
    paddingVertical: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    marginVertical: 5,
  },
  actionItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between', // o 'center' si prefieres centrarlos
  paddingHorizontal: 10,
    marginBottom: 20, // espacio entre botones y el resto del contenido
},

logoutButton: {
  backgroundColor: 'white',
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginHorizontal: 5, // espaciado entre botones
  flex: 1, // distribuye espacio equitativamente (opcional)
},
  textContainer: {
    flex: 1,
    maxHeight: 200,
    marginVertical: 10,
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9'
  },
  text: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22
  }
});