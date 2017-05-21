import Expo, { Constants } from 'expo';
import React from 'react';
import { range } from 'lodash';
import {
  StyleSheet,
  Animated,
  View,
  Modal,
  Dimensions,
  Text
} from 'react-native';

export default class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indicators: [
        new Animated.Value(0),
        new Animated.Value(50),
        new Animated.Value(10),
        new Animated.Value(80),
        new Animated.Value(30)
      ]
    };
  }
  componentDidMount() {
    for (const i in range(0, 5)) {
      this.animation(i);
    }
  }
  animation(i) {
    const { width, height } = Dimensions.get('window');
    const maxValue = 50;
    Animated.sequence([
      Animated.timing(this.state.indicators[i], {
        toValue: Math.floor(Math.random() * maxValue)
      }),
      Animated.timing(this.state.indicators[i], {
        toValue: 0
      })
    ]).start(event => {
      if (event.finished) {
        this.animation(i);
      }
    });
  }
  render() {
    let loadingText = this.props.text || 'Loading...';
    return (
      <Modal visible={true} transparent={true}>
        <View style={styles.backDrop}>
          <View style={styles.modalContainer}>
            <View style={styles.indicatorContainer}>
              <Animated.View
                style={[{ height: this.state.indicators[0] }, styles.barStyle]}
              />
              <Animated.View
                style={[{ height: this.state.indicators[1] }, styles.barStyle]}
              />
              <Animated.View
                style={[{ height: this.state.indicators[2] }, styles.barStyle]}
              />
              <Animated.View
                style={[{ height: this.state.indicators[3] }, styles.barStyle]}
              />
              <Animated.View
                style={[{ height: this.state.indicators[4] }, styles.barStyle]}
              />
            </View>
            <Text style={styles.text}>{loadingText}</Text>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  backDrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C44',
    paddingLeft: 50,
    paddingRight: 50
  },
  modalContainer: {
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    padding: 20
  },
  indicatorContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80
  },
  text: {
    color: '#FFFFFB'
  },
  barStyle: {
    backgroundColor: 'red',
    borderRadius: 5,
    width: 8,
    margin: 5
  }
});
