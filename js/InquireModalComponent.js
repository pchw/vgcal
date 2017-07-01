import Expo, { Constants } from 'expo';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  DatePickerIOS,
  KeyboardAvoidingView,
  Keyboard,
  WebView
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import moment from 'moment';
import qs from 'qs';
import axios from 'axios';

const ODAIBAKO_TOKEN_URL = 'https://odaibako.net/u/pchw';
const ODAIBAKO_POST_URL = 'https://odaibako.net/post/request/pchw';

export default class InquireModalComponent extends React.Component {
  constructor(props) {
    super(props);
    const now = new Date();
    this.state = {
      name: '@',
      detail: '',
      message: '',
      messageType: '',
      csrfmiddlewaretoken: '',
      cookie: ''
    };
  }
  componentDidMount() {
    this.getOdaibako();
  }
  getOdaibako() {
    axios
      .get(ODAIBAKO_TOKEN_URL)
      .then(response => {
        // <input type='hidden' name='csrfmiddlewaretoken' value='xxxx' />
        const matcher = response.data.match(/name=['"]csrfmiddlewaretoken['"][\s]*value=['"]([^'"]+)['"]/);
        this.setState({
          csrfmiddlewaretoken: matcher[1],
          cookie: `${response.headers['set-cookie'].split(';')[0]};`
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          message: '問い合わせフォームのサービスがダウンしています',
          messageType: 'error'
        });
      });
  }
  postOdaibako(){
    if (!this.state.csrfmiddlewaretoken || !this.state.cookie) {
      return this.setState({
          message: '問い合わせフォームのサービスがダウンしています',
          messageType: 'error'
        });
    }

    // Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
    // Accept-Encoding:gzip, deflate
    // Accept-Language:ja,en-US;q=0.8,en;q=0.6
    // Cache-Control:max-age=0
    // Connection:keep-alive
    // Content-Length:94
    // Content-Type:application/x-www-form-urlencoded
    // Cookie:csrftoken=K9BeFUpFEzOPimUV7GSkNZpJNkGH2vLsu5WHITAnyxjXJwSHelYY1vjpf3livGgZ; _ga=GA1.2.76190232.1496557352; _gid=GA1.2.2111760270.1496557352
    // Host:odaibako.net
    // Origin:http://odaibako.net
    // Referer:http://odaibako.net/u/pchw
    // Upgrade-Insecure-Requests:1
    axios({
      url: ODAIBAKO_POST_URL,
      method: 'post',
      headers:{
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'ja,en-US;q=0.8,en;q=0.6',
        'Connection': 'keep-alive',
        'Origin': 'https://odaibako.net',
        'Cookie': this.state.cookie,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      },
      data: qs.stringify({
        text: `name: ${this.state.name}\nbody: ${this.state.detail}`,
        csrfmiddlewaretoken: this.state.csrfmiddlewaretoken
      }),
      responseType: 'text'
    })
      .then(response => {
        // 成功
        this.setState({
          message: 'お問い合わせを受け付けました',
          messageType: 'success'
        });
      })
      .catch(err => {
        console.error(err, err.message);
        this.setState({
          message: 'エラーが発生しました．3分ほど時間をおいてお試しください．',
          messageType: 'error'
        });
      });
  }

  render() {
    let message;
    let messageStyle;
    if (this.state.message) {
      if (this.state.messageType === 'error') {
        messageStyle = { backgroundColor: '#CB1B45CC' };
      }
      message = (
        <TouchableOpacity
          onPress={() => {
            this.setState({ message: '' });
          }}
        >
          <View style={[styles.subHeader, messageStyle]}>
            <Text>{this.state.message}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <Modal animationType={'slide'}>

        <View style={styles.header}>
          <View style={(styles.headerItem, { flex: 1 })}>
            <TouchableOpacity onPress={this.props.onClose.bind(this)}>
              <Text>戻る</Text>
            </TouchableOpacity>
          </View>
          <View style={(styles.headerItem, { flex: 2 })}>
            <Text>お問い合わせ</Text>
          </View>
        </View>
        {message}

        <KeyboardAvoidingView behavior="padding" style={styles.body}>

            <View style={styles.formItem}>
              <Text>Twitterユーザ名</Text>
            </View>
            <View style={[styles.input, { flex: 1 }]}>
              <TextInput
                style={[{ flex: 1 }]}
                value={this.state.name}
                onChangeText={t => {
                  this.setState({ name: t });
                }}
              />
            </View>
            <View style={styles.formItem}>
              <Text>お問い合わせ内容</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 5 }]}
              multiline={true}
              value={this.state.detail}
              onChangeText={t => {
                this.setState({ detail: t });
              }}
            />
            <TouchableOpacity style={styles.formButton} onPress={this.postOdaibako.bind(this)}>
              <Text>問い合わせる</Text>
            </TouchableOpacity>

        </KeyboardAvoidingView>

      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  rightText: {
    textAlign: 'right'
  },
  header: {
    flex: 1,
    backgroundColor: '#EAB0B0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Constants.statusBarHeight + 15
  },
  headerItem: {
    flex: 1,
    alignSelf: 'center'
  },
  subHeader: {
    alignItems: 'center',
    backgroundColor: '#51A8DD',
    padding: 10
  },
  formRow: {
    alignItems: 'stretch',
    padding: 15
  },
  formItem: {
    backgroundColor: '#EAB0B0',
    alignItems: 'center',
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 0,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1
  },
  formButton: {
    backgroundColor: '#EAB0B0',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
    borderWidth: 0,
    marginBottom: 15
  },
  input: {
    flex: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    borderWidth: 1,
    borderTopWidth: 0,
    marginBottom: 5,
    padding: 10,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginBottom: 15
  },
  body: {
    flex: 25,
    margin: 15
  }
});
