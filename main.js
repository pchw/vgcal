import Expo, { Constants } from 'expo';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { range } from 'lodash';
import moment from 'moment';
import uuid from 'react-native-uuid';
import ical from './vendor/ical';

const ICAL_URL =
  'https://calendar.google.com/calendar/ical/rjvobdbsvqu8f3ddf6f0ofg0as%40group.calendar.google.com/public/basic.ics';

import Database from './js/db';
let db = new Database();

import Calendar from './js/CalendarComponent';
import Note from './js/NoteComponent';
import Loading from './js/LoadingComponent';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      plans: {},
      selectedDate: moment(),
      isLoading: false,
      loadedCount: 0
    };

    this.queryCalendarItem(this.state.selectedDate);
  }
  componentDidMount() {
    const self = this;
    let promises = [];
    this.setState({ isLoading: true });
    ical.fromURL(ICAL_URL, {}, function(err, data) {
      if (err) {
        alert(err);
      }
      db
        .prepare()
        .then(() => {
          for (const key in data) {
            promises.push(
              new Promise((resolve, reject) => {
                return db.upsertItem(data[key]).then(() => {
                  self.incrementLoaded();
                  return resolve();
                });
              })
            );
          }
          Promise.all(promises)
            .then(() => {
              self.setState({ isLoading: false });
              self.queryCalendarItem(self.state.selectedDate);
            })
            .catch(err => {
              alert(err);
            });
        })
        .catch(err => {
          alert(err);
        });
    });
  }
  render() {
    let notes = [];
    for (const key in this.state.items) {
      const item = this.state.items[key];
      notes.push(
        <Note
          key={item.uid}
          start={item.start}
          title={item.summary}
          description={item.description}
        />
      );
    }
    if (notes.length === 0) {
      notes.push(
        <Note
          key={uuid.v1()}
          start={this.state.selectedDate.format()}
          title={'予定されている大会はありません'}
          description={''}
        />
      );
    }
    let loadingView;
    if (this.state.isLoading) {
      loadingView = (
        <Loading
          text={`Loading calendar...[${this.state.loadedCount} loaded]`}
        />
      );
    }
    return (
      <View style={styles.container}>
        {loadingView}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerItem}>
            <View style={styles.headerButton}>
              <Entypo name="chevron-left" size={17} />
              <Text>Menu</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerItem}>
            <Text style={styles.headerTitle}>VG Cal</Text>
          </View>

          <TouchableOpacity
            style={styles.headerItem}
            onPress={this.today.bind(this)}
          >
            <View>
              <Text style={styles.headerRight}>Today</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.calendarHeaderContainer}>
          <View style={styles.calendarHeaderItem}>
            <TouchableOpacity onPress={this.prevMonth.bind(this)}>
              <Entypo name="chevron-left" size={18} color="#333" />
            </TouchableOpacity>
            <Text style={styles.calendarHeaderText}>
              {this.state.selectedDate.format('YYYY')}
              {' '}
              {this.state.selectedDate.format('MMM')}
            </Text>
            <TouchableOpacity onPress={this.nextMonth.bind(this)}>
              <Entypo name="chevron-right" size={18} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        <Calendar
          style={styles.calendarContainer}
          date={this.state.selectedDate.format('YYYY-MM-DD')}
          onPress={this.onPressCalendarDate.bind(this)}
          plans={this.state.plans}
        />
        <View style={styles.noteContainer}>
          <ScrollView>
            {notes}
          </ScrollView>
        </View>
      </View>
    );
  }
  incrementLoaded() {
    this.setState({
      loadedCount: ++this.state.loadedCount
    });
  }
  queryCalendarItem(date) {
    promises = [];
    promises.push(
      db
        .prepare()
        .then(() => {
          return db.findItems({ date: date.format('YYYY-MM-DD') });
        })
        .then(items => {
          this.setState({ items: items });
          return Promise.resolve();
        })
        .catch(err => {
          alert(err);
        })
    );
    promises.push(
      db
        .prepare()
        .then(() => {
          return db.findCurrentMonthItems({ date: date.format('YYYY-MM') });
        })
        .then(items => {
          plans = {};
          (items || []).forEach(item => {
            plans[moment(item.start).format('YYYY-MM-DD')] = true;
          });
          this.setState({ plans: plans });
          return Promise.resolve();
        })
    );

    Promise.all(promises, () => {});
  }
  onPressCalendarDate(date) {
    this.setState({
      selectedDate: moment(date)
    });
    this.queryCalendarItem(moment(date));
  }
  nextMonth() {
    const day = this.state.selectedDate.clone().add(1, 'month');
    this.setState({
      selectedDate: day
    });
    this.queryCalendarItem(day);
  }
  prevMonth() {
    const day = this.state.selectedDate.clone().subtract(1, 'month');
    this.setState({
      selectedDate: day
    });
    this.queryCalendarItem(day);
  }
  today() {
    const day = moment();
    this.setState({
      selectedDate: day
    });
    this.queryCalendarItem(day);
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1
  },
  header: {
    flex: 1,
    backgroundColor: '#EAB0B0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: Constants.statusBarHeight
  },
  headerItem: {
    flex: 1,
    alignSelf: 'center'
  },
  headerButton: {
    flexDirection: 'row'
  },
  headerTitle: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  headerRight: {
    textAlign: 'right'
  },
  noteContainer: {
    flex: 16
  },
  calendarContainer: {
    flex: 16
  },
  calendarHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 15
  },
  calendarHeaderItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  calendarHeaderText: {
    fontWeight: 'bold',
    fontSize: 15
  }
});

Expo.registerRootComponent(App);

let r = {
  'tn9lbnf7iugu5hcr1fphpequak@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-06-11T11:00:00.000Z',
    end: '2017-06-11T14:59:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'tn9lbnf7iugu5hcr1fphpequak@google.com',
    created: '2017-05-13T22:26:01.000Z',
    description: '通常のトーナメント大会 第1回大会参照',
    lastmodified: '2017-05-13T22:26:01.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '第2回 りんと杯',
    transparency: 'OPAQUE'
  },
  'tt8k584s2vd4vnuuo44nihp1q0@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-06-10T11:00:00.000Z',
    end: '2017-06-10T14:59:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'tt8k584s2vd4vnuuo44nihp1q0@google.com',
    created: '2017-05-13T22:25:10.000Z',
    description: '通常のトーナメント大会 第1回大会参照',
    lastmodified: '2017-05-13T22:25:10.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '第2回 りんと杯 ',
    transparency: 'OPAQUE'
  },
  '1r619ggkcuoqn212tvqu3d0i9c@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-06-09T11:00:00.000Z',
    end: '2017-06-09T14:59:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '1r619ggkcuoqn212tvqu3d0i9c@google.com',
    created: '2017-05-13T22:22:54.000Z',
    description: '通常のトーナメント大会 第1回大会参照',
    lastmodified: '2017-05-13T22:22:54.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '第2回 りんと杯',
    transparency: 'OPAQUE'
  },
  'ioes2pv6293hudj0emav990hv4@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-16T12:00:00.000Z',
    end: '2017-05-16T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'ioes2pv6293hudj0emav990hv4@google.com',
    created: '2017-05-12T13:17:07.000Z',
    description: 'http://team-detonation.net/news/12866\n日時2017年5月15日・16日(月・火)　開始21時～\n配信OPENREC DetonatioN Gaming チャンネル[Day1]\nOPENREC DetonatioN Gaming チャンネル[Day2]\n※大会の試合配信は指定しますので、各チームご協力ください。\n実施内容ドラフトモードの最大96チームによるトーナメント\nルールドラフトモード(BO1※決勝のみBO3)\n参加チーム数最大96チーム(抽選)\n試合スケジュール1日目21時～：96チームから8チームまで試合実施\n2日目21時～：8チームから決勝まで試合を実施\n実況／解説STR1125\nトーナメント賞品優勝チーム：6000ICE\n準優勝チーム：3000ICE',
    lastmodified: '2017-05-12T13:17:07.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '【第5回Vainglory大会】最大96チームによるドラフトモードトーナメント',
    transparency: 'OPAQUE'
  },
  '2fl2t156d2p6e3ai203upj0708@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-15T12:00:00.000Z',
    end: '2017-05-15T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '2fl2t156d2p6e3ai203upj0708@google.com',
    created: '2017-05-12T13:16:30.000Z',
    description: 'http://team-detonation.net/news/12866\n日時2017年5月15日・16日(月・火)　開始21時～\n配信OPENREC DetonatioN Gaming チャンネル[Day1]\nOPENREC DetonatioN Gaming チャンネル[Day2]\n※大会の試合配信は指定しますので、各チームご協力ください。\n実施内容ドラフトモードの最大96チームによるトーナメント\nルールドラフトモード(BO1※決勝のみBO3)\n参加チーム数最大96チーム(抽選)\n試合スケジュール1日目21時～：96チームから8チームまで試合実施\n2日目21時～：8チームから決勝まで試合を実施\n実況／解説STR1125\nトーナメント賞品優勝チーム：6000ICE\n準優勝チーム：3000ICE',
    lastmodified: '2017-05-12T13:16:30.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '【第5回Vainglory大会】最大96チームによるドラフトモードトーナメント',
    transparency: 'OPAQUE'
  },
  'fj4b61j7pqqjq53vq9bivrebu8@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-27T05:00:00.000Z',
    end: '2017-05-27T13:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'fj4b61j7pqqjq53vq9bivrebu8@google.com',
    created: '2017-05-10T03:36:10.000Z',
    description: "配信 URL: openrec.tv/live/vainglory_jp \nhttp://www.4gamer.net/games/273/G027362/20170510022/\nさらに、日本の『Vainglory』ファンに向けて、秋葉原の e-Sports Square にて観戦イベントの開催も決定いたしました。\n\n【『Vainglory8』東アジア スプリング・チャンピオンシップ概要】\nVainglory\n\n東アジアのトップクラスの Vainglory チームが 5 月 27 日、東京で初開催となるオフライン大会に集結!\nスプリングシーズンの上位 4 チームが都内の OPENREC STUDIO で行われる、アクション満載の 1 日間のトーナメントで戦います。対戦の模様は日本語、韓国語、英語で生配信されます。また、スプリング・チャンピオンシップの勝者は 2017年末に開催される「Vainglory World Championship」への出場権を獲得します。 スプリング・チャンピオンシップの対戦はすべて 3 戦先取のシングルイリミネーション形式(敗者復活なし)で行われます。\n\nさらに、日本のファンの皆様は、e-Sports Square で行われる観戦イベントでチャンピオンシップに出場したメンバーと実際に会うことができます。\n\n出場チーム:\nDetonation Gaming(日本)\nInvincible Armada(韓国)\nACE Gaming(韓国)\nTeam pQq(韓国)\n配信 URL: openrec.tv/live/vainglory_jp (5 月 27 日 14:00～放送予定)\n\n【『Vainglory8』東アジア スプリング・チャンピオンシップ 観戦イベント概要】\n・秋葉原の e-Sports Square にて観戦イベントを実施します。\n※住所:〒101-0021 東京都千代田区外神田3－2－12 Box'～ AKIBA ビル 2F\ngoogle map: https://goo.gl/maps/qVU1D6dULbk\n\n概要:\n・9:00 開場、22:00 閉場。入場無料。\n※当日は出入り自由となります。\n・試合終了次第選手が会場に来場し、ファンの皆様との交流イベントを実施します。また、当日、プレゼントが当たる企画や、ユーザー参加企画も予定しております。\n\n詳細は下記サイトでご確認ください。\nhttps://peraichi.com/landing_pages/view/vainglory8",
    lastmodified: '2017-05-10T03:36:10.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '『Vainglory8』東アジア スプリング・チャンピオンシップ',
    transparency: 'OPAQUE'
  },
  'e9j4eh6md86gdh6gt3hu3cfrp0@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-19T10:00:00.000Z',
    end: '2017-05-19T12:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'e9j4eh6md86gdh6gt3hu3cfrp0@google.com',
    created: '2017-05-09T11:54:41.000Z',
    description: 'https://twitter.com/VaingloryJP/status/858127535246155777\n参加型イベント「Vaingloryロードショー」開催📽️\n　日程：5月19日(金)午後7時開演\n　会場：AEON CINEMA 板橋（東京）\n\n詳細・チケット購入はこちら\n➡(link: http://t.livepocket.jp/e/vgchinema) t.livepocket.jp/e/vgchinema\n\n#Vainglory　#Vaingloryシネマ ',
    lastmodified: '2017-05-09T11:54:41.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Vaingloryロードショー',
    transparency: 'OPAQUE'
  },
  'poku4i417vq1eav9324lcpthuc@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-11T10:10:00.000Z',
    end: '2017-05-11T12:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'poku4i417vq1eav9324lcpthuc@google.com',
    created: '2017-05-09T08:45:15.000Z',
    description: 'https://cyac.com/node/133286\n開催日時: 2017/5/11 19:10\nタイプ: 総当たり戦\nゲーム:\nVainglory Vainglory\nプラットフォーム:\nMobile Mobile\n某Sデジタルがガチで行うVaingloryの社内対抗戦の予選大会！\n2つのグループに分かれて予選大会を行い、各グループの最上位が決勝大会に進出します。\n優勝した部署には社長からの賞品もあります！',
    lastmodified: '2017-05-09T08:45:15.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '鳥居杯予選大会',
    transparency: 'OPAQUE'
  },
  '4b87dp3u0b86cti99dun6fjauk@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-23T12:30:00.000Z',
    end: '2017-05-23T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '4b87dp3u0b86cti99dun6fjauk@google.com',
    created: '2017-05-09T08:43:34.000Z',
    description: 'https://twitter.com/pock11042/status/861355134470676480',
    lastmodified: '2017-05-09T08:43:34.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'お中元杯',
    transparency: 'OPAQUE'
  },
  'f6c9l7do0oecffp4305v61nsm0@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-12T11:00:00.000Z',
    end: '2017-05-12T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'f6c9l7do0oecffp4305v61nsm0@google.com',
    created: '2017-05-08T08:16:36.000Z',
    description: 'http://gamersleague.asia/tournament/33\n\n参加チーム上限\n\n16チーム・抽選\n\n特典\n\n後日追記\n\n参加受付期間\n\n参加受付期間: 2017年05月02日 20:00 〜 05月08日 20:00まで\n\n大会開催日程\n\n2017年05月12日(金)\n第1回戦：20:00〜\n第2回戦：20:40～\n準決勝戦：21:20～\n決勝戦　：22:00～\n\n対戦方式\n\nシングルエリミネーショントーナメント\nBo1方式\n\n対戦ルール\n\nドラフトピック\n(プライベートマッチにてドラフトピックで試合を進行します。両チームともBANをしなければいけません。)\n\n当日の進行\n\n対戦表左側（スマートフォンの場合上側）のチームの代表者が、相手チームメンバーとゲーム内にてフレンド登録を行い、出場メンバーを招待し、指定の対戦開始時刻になり次第試合をスタートさせてください。\nトーナメント表左側（スマートフォンの場合上側）のチームが先行BAN(ブルーサイド)となります。\n\n結果報告について\n\n試合が終わったら勝利・敗北に関わらず、結果報告をするようにしてください。（大会ページ > 結果報告）\nまた、試合結果の分かるスクリーンショットの撮影を両チームともにしておくようにしてください。\n\n申告された結果報告内容が虚偽のものである可能性があった場合に、当該チームへ確認を行います。\nその際にスクリーンショットの提出を求めます。\n\n棄権に関して\n\n試合開始時刻を10分以上してメンバーが揃わないチームは棄権として処理されます。\n\n禁止事項\n\n運営チームが不適切とみなした行為全般\n複数チームに同一プレイヤーがエントリーする行為\n公序良俗に反するIGN\n侮辱的な行動や言動\n事前に試合の結果を対戦チーム間で操作する行為\n\n禁止行為を行ったプレイヤーまたはチームは失格となりエントリーが取り消されます。\n今後の大会への参加も制限される場合があります。\n\n登録内容の変更に関して\n\n参加登録期間中であれば、エントリーの登録内容の変更は可能です。\n変更がある場合は、一度大会への登録を棄権し、再度正しい情報にて参加登録を行ってください。\n参加登録期間以降のメンバーの変更はできません。',
    lastmodified: '2017-05-08T08:16:36.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'HALCYON FIGHT',
    transparency: 'OPAQUE'
  },
  '8oqetdrqgm82o0le2ti3gj3t10@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-06-04T12:00:00.000Z',
    end: '2017-06-04T14:30:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '8oqetdrqgm82o0le2ti3gj3t10@google.com',
    created: '2017-05-07T23:06:41.000Z',
    description: '個人で応募する電撃モード大会\n応募に制限は一切無し\n配信→https://www.mirrativ.com/user/403256',
    lastmodified: '2017-05-07T23:06:41.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '電撃Gcup杯',
    transparency: 'OPAQUE'
  },
  'rh67qg46ck693mvj4t674mtcpo@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-20T12:00:00.000Z',
    end: '2017-05-20T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'rh67qg46ck693mvj4t674mtcpo@google.com',
    created: '2017-05-04T06:02:55.000Z',
    description: 'https://twitter.com/pock11042/status/860007584924745728\nマルキドさんと底辺配信者の威信をかけて変則Bo3やると思います\n本人を含め9人の各一戦参加でやるはず\n試合毎に勝った人とBo3トータルで勝ったチームに\nなにかしらのご褒美用意する予定です\n階層はマルキドさんと話してある程度帳尻あわせると思うので\n日程的に大丈夫な方はどんどんDMでも下さい\n誰でも歓迎なので気軽にお願い致します',
    lastmodified: '2017-05-04T06:02:55.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: '底辺配信者の威信をかけた変則Bo3',
    transparency: 'OPAQUE'
  },
  'mmgsr556ofui0e60500ab4gojk@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-07T12:00:00.000Z',
    end: '2017-05-07T14:30:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'mmgsr556ofui0e60500ab4gojk@google.com',
    created: '2017-04-26T10:37:19.000Z',
    description: 'ドラフトピック、チーム応募の大会です。\nチームメンバーに女性が必要です。\n階層、ゲーム内チームなどの制限はありません。\n\n配信は主催者以外の枠になる可能性があります。\n主催者→https://www.openrec.tv/live/2nyaM',
    lastmodified: '2017-04-26T10:37:19.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Gcup',
    transparency: 'OPAQUE'
  },
  'lvro4aj5j2e9mlgsvkr0pdngck@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-06T12:00:00.000Z',
    end: '2017-05-06T14:30:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'lvro4aj5j2e9mlgsvkr0pdngck@google.com',
    created: '2017-04-26T10:36:44.000Z',
    description: 'ドラフトピック、チーム応募の大会です。\nチームメンバーに女性が必要です。\n階層、ゲーム内チームなどの制限はありません。\n\n配信は主催者以外の枠になる可能性があります。\n主催者→https://www.openrec.tv/live/2nyaM',
    lastmodified: '2017-04-26T10:36:44.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Gcup',
    transparency: 'OPAQUE'
  },
  '8c6t86mj9nsjcvqmmmihr9gqtc@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-14T08:00:00.000Z',
    end: '2017-05-14T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '8c6t86mj9nsjcvqmmmihr9gqtc@google.com',
    created: '2017-04-26T09:27:07.000Z',
    description: '配信URLhttps://www.openrec.tv/live/vainglory_jp\n日時Split1\n2017年3月18日（土）, 3月19日（日）, 3月25日（土）, 3月26日（日）, 4月1日（土）, 4月2日（日）, 4月8日（土）, 4月9日（日）, 4月10日（月）, 4月15日（土）, 4月16日（日）\nSplit2\n2017年4月22日（土）, 4月23日（日）, 4月29日（土）, 4月30日（日）, 5月6日（土）, 5月7日（日）, 5月8日（月）, 5月13日（土）, 5月14日（日）\nすべて17時から配信予定\nイベントスケジュールはこちら\n賞金総額25,000 USドル\nキャスターZyamanobeds / Mokson',
    lastmodified: '2017-04-26T09:27:07.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Vainglory8 Split2',
    transparency: 'OPAQUE'
  },
  '6qjug4rccprjb7lkvmctbq2juo@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-13T08:00:00.000Z',
    end: '2017-05-13T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '6qjug4rccprjb7lkvmctbq2juo@google.com',
    created: '2017-04-26T09:26:38.000Z',
    description: '配信URLhttps://www.openrec.tv/live/vainglory_jp\n日時Split1\n2017年3月18日（土）, 3月19日（日）, 3月25日（土）, 3月26日（日）, 4月1日（土）, 4月2日（日）, 4月8日（土）, 4月9日（日）, 4月10日（月）, 4月15日（土）, 4月16日（日）\nSplit2\n2017年4月22日（土）, 4月23日（日）, 4月29日（土）, 4月30日（日）, 5月6日（土）, 5月7日（日）, 5月8日（月）, 5月13日（土）, 5月14日（日）\nすべて17時から配信予定\nイベントスケジュールはこちら\n賞金総額25,000 USドル\nキャスターZyamanobeds / Mokson',
    lastmodified: '2017-04-26T09:26:38.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Vainglory8 Split2',
    transparency: 'OPAQUE'
  },
  '2dnpm8jhgm9dt0vuc3h75q6o54@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-08T08:00:00.000Z',
    end: '2017-05-08T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '2dnpm8jhgm9dt0vuc3h75q6o54@google.com',
    created: '2017-04-26T09:26:14.000Z',
    description: '配信URLhttps://www.openrec.tv/live/vainglory_jp\n日時Split1\n2017年3月18日（土）, 3月19日（日）, 3月25日（土）, 3月26日（日）, 4月1日（土）, 4月2日（日）, 4月8日（土）, 4月9日（日）, 4月10日（月）, 4月15日（土）, 4月16日（日）\nSplit2\n2017年4月22日（土）, 4月23日（日）, 4月29日（土）, 4月30日（日）, 5月6日（土）, 5月7日（日）, 5月8日（月）, 5月13日（土）, 5月14日（日）\nすべて17時から配信予定\nイベントスケジュールはこちら\n賞金総額25,000 USドル\nキャスターZyamanobeds / Mokson',
    lastmodified: '2017-04-26T09:26:14.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Vainglory8 Split2',
    transparency: 'OPAQUE'
  },
  'm23rdeiaa30ev3bip9cvqmu2s4@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-07T08:00:00.000Z',
    end: '2017-05-07T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'm23rdeiaa30ev3bip9cvqmu2s4@google.com',
    created: '2017-04-26T09:25:47.000Z',
    description: '配信URLhttps://www.openrec.tv/live/vainglory_jp\n日時Split1\n2017年3月18日（土）, 3月19日（日）, 3月25日（土）, 3月26日（日）, 4月1日（土）, 4月2日（日）, 4月8日（土）, 4月9日（日）, 4月10日（月）, 4月15日（土）, 4月16日（日）\nSplit2\n2017年4月22日（土）, 4月23日（日）, 4月29日（土）, 4月30日（日）, 5月6日（土）, 5月7日（日）, 5月8日（月）, 5月13日（土）, 5月14日（日）\nすべて17時から配信予定\nイベントスケジュールはこちら\n賞金総額25,000 USドル\nキャスターZyamanobeds / Mokson',
    lastmodified: '2017-04-26T09:25:47.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Vainglory8 Split2',
    transparency: 'OPAQUE'
  },
  'lv6dnk3jin2q43ubf7n4vma7qc@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-05-06T08:00:00.000Z',
    end: '2017-05-06T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'lv6dnk3jin2q43ubf7n4vma7qc@google.com',
    created: '2017-04-26T09:25:17.000Z',
    description: '配信URLhttps://www.openrec.tv/live/vainglory_jp\n日時Split1\n2017年3月18日（土）, 3月19日（日）, 3月25日（土）, 3月26日（日）, 4月1日（土）, 4月2日（日）, 4月8日（土）, 4月9日（日）, 4月10日（月）, 4月15日（土）, 4月16日（日）\nSplit2\n2017年4月22日（土）, 4月23日（日）, 4月29日（土）, 4月30日（日）, 5月6日（土）, 5月7日（日）, 5月8日（月）, 5月13日（土）, 5月14日（日）\nすべて17時から配信予定\nイベントスケジュールはこちら\n賞金総額25,000 USドル\nキャスターZyamanobeds / Mokson',
    lastmodified: '2017-04-26T09:25:17.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Vainglory8 Split2',
    transparency: 'OPAQUE'
  },
  '0q9uvgk0kcoo9op51n2he19pmk@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-04-30T08:00:00.000Z',
    end: '2017-04-30T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '0q9uvgk0kcoo9op51n2he19pmk@google.com',
    created: '2017-04-26T09:24:51.000Z',
    description: '配信URLhttps://www.openrec.tv/live/vainglory_jp\n日時Split1\n2017年3月18日（土）, 3月19日（日）, 3月25日（土）, 3月26日（日）, 4月1日（土）, 4月2日（日）, 4月8日（土）, 4月9日（日）, 4月10日（月）, 4月15日（土）, 4月16日（日）\nSplit2\n2017年4月22日（土）, 4月23日（日）, 4月29日（土）, 4月30日（日）, 5月6日（土）, 5月7日（日）, 5月8日（月）, 5月13日（土）, 5月14日（日）\nすべて17時から配信予定\nイベントスケジュールはこちら\n賞金総額25,000 USドル\nキャスターZyamanobeds / Mokson',
    lastmodified: '2017-04-26T09:24:51.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Vainglory8 Split2',
    transparency: 'OPAQUE'
  },
  '6d6d9m7tsn73aiq2ubunhmlgig@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-04-29T08:00:00.000Z',
    end: '2017-04-29T14:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '6d6d9m7tsn73aiq2ubunhmlgig@google.com',
    created: '2017-04-26T09:24:24.000Z',
    description: '配信URLhttps://www.openrec.tv/live/vainglory_jp\n日時Split1\n2017年3月18日（土）, 3月19日（日）, 3月25日（土）, 3月26日（日）, 4月1日（土）, 4月2日（日）, 4月8日（土）, 4月9日（日）, 4月10日（月）, 4月15日（土）, 4月16日（日）\nSplit2\n2017年4月22日（土）, 4月23日（日）, 4月29日（土）, 4月30日（日）, 5月6日（土）, 5月7日（日）, 5月8日（月）, 5月13日（土）, 5月14日（日）\nすべて17時から配信予定\nイベントスケジュールはこちら\n賞金総額25,000 USドル\nキャスターZyamanobeds / Mokson',
    lastmodified: '2017-04-26T09:24:24.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'Vainglory8 Split2',
    transparency: 'OPAQUE'
  },
  'nnscvi7dqfptb6sl7lukl84108@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-04-26T15:00:00.000Z',
    end: '2017-04-26T20:00:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'nnscvi7dqfptb6sl7lukl84108@google.com',
    created: '2017-04-26T04:19:20.000Z',
    description: 'http://superevil.co/update24',
    lastmodified: '2017-04-26T04:19:20.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'アップデート2.4 サーバーダウン',
    transparency: 'OPAQUE'
  },
  'qh5ffd8l0uq1f2r179jvesqhng@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-04-25T11:00:00.000Z',
    end: '2017-04-25T14:30:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'qh5ffd8l0uq1f2r179jvesqhng@google.com',
    created: '2017-04-25T11:43:45.000Z',
    description: 'GLM',
    lastmodified: '2017-04-26T04:12:52.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'GAMERS LEAGUE MASTERS 2017 Spring Split2',
    transparency: 'OPAQUE'
  },
  'u7oibkeju4uvgjfi9qtmari4qc@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-04-28T10:30:00.000Z',
    end: '2017-04-28T14:30:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'u7oibkeju4uvgjfi9qtmari4qc@google.com',
    created: '2017-04-26T04:12:17.000Z',
    description: '128チーム・抽選\n\n特典\n\n優勝チーム：$500 + 9000 ICE + Vainglory8挑戦権\n準優勝チーム：$250 + 6000 ICE\n3位・4位チーム：$125\n(チーム単位での付与となります。)\n\n※Vainglory8挑戦権について\n今回のGLM優勝チームには5月8日(月)に開催されるアジア地域のチャレンジャー順位付け戦へ挑戦する権利が与えられます。\nその後Vainglory8出場チームとの入れ替え戦に臨むことができます。\n入れ替え戦に勝利することで、Summer Split1からVainglory8に出場することができます。\n\n※Vainglory8規定により、優勝したチームは登録メンバーが5名もしくは6名だった場合、\n登録メンバーが4名もしくは3名になるように調整が必要です。\n\n',
    lastmodified: '2017-04-26T04:12:17.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'GAMERS LEAGUE MASTERS 2017 Spring Split2',
    transparency: 'OPAQUE'
  },
  'j1gmhq8h87vd2808444fsf75ls@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-04-27T10:30:00.000Z',
    end: '2017-04-27T14:30:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: 'j1gmhq8h87vd2808444fsf75ls@google.com',
    created: '2017-04-26T04:11:38.000Z',
    description: '128チーム・抽選\n\n特典\n\n優勝チーム：$500 + 9000 ICE + Vainglory8挑戦権\n準優勝チーム：$250 + 6000 ICE\n3位・4位チーム：$125\n(チーム単位での付与となります。)\n\n※Vainglory8挑戦権について\n今回のGLM優勝チームには5月8日(月)に開催されるアジア地域のチャレンジャー順位付け戦へ挑戦する権利が与えられます。\nその後Vainglory8出場チームとの入れ替え戦に臨むことができます。\n入れ替え戦に勝利することで、Summer Split1からVainglory8に出場することができます。\n\n※Vainglory8規定により、優勝したチームは登録メンバーが5名もしくは6名だった場合、\n登録メンバーが4名もしくは3名になるように調整が必要です。',
    lastmodified: '2017-04-26T04:11:38.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'GAMERS LEAGUE MASTERS 2017 Spring Split2',
    transparency: 'OPAQUE'
  },
  '36pqm0hge0372mkej00a7lbrk8@google.com': {
    type: 'VEVENT',
    params: [],
    start: '2017-04-26T10:30:00.000Z',
    end: '2017-04-26T14:30:00.000Z',
    dtstamp: '2017-05-14T15:21:25.000Z',
    uid: '36pqm0hge0372mkej00a7lbrk8@google.com',
    created: '2017-04-26T04:10:18.000Z',
    description: '128チーム・抽選\n\n特典\n\n優勝チーム：$500 + 9000 ICE + Vainglory8挑戦権\n準優勝チーム：$250 + 6000 ICE\n3位・4位チーム：$125\n(チーム単位での付与となります。)\n\n※Vainglory8挑戦権について\n今回のGLM優勝チームには5月8日(月)に開催されるアジア地域のチャレンジャー順位付け戦へ挑戦する権利が与えられます。\nその後Vainglory8出場チームとの入れ替え戦に臨むことができます。\n入れ替え戦に勝利することで、Summer Split1からVainglory8に出場することができます。\n\n※Vainglory8規定により、優勝したチームは登録メンバーが5名もしくは6名だった場合、\n登録メンバーが4名もしくは3名になるように調整が必要です。',
    lastmodified: '2017-04-26T04:10:18.000Z',
    location: '',
    sequence: '0',
    status: 'CONFIRMED',
    summary: 'GAMERS LEAGUE MASTERS 2017 Spring Split2',
    transparency: 'OPAQUE'
  }
};
