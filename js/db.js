import Expo, { SQLite } from 'expo';
import moment from 'moment';

export default class Database {
  constructor() {
    this.db = SQLite.openDatabase({ name: 'db.db' });
  }

  prepare() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            'create table if not exists tournaments (uid text primary key not null, type text, start DATETIME, end DATETIME, description text, summary text);'
          );
        },
        err => {
          reject(err);
        },
        err => {
          resolve();
        }
      );
    });
  }

  upsertItem(item) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          const fields = [
            'type',
            'start',
            'end',
            'uid',
            'description',
            'summary'
          ];
          const placeholders = fields
            .map(() => {
              return '?';
            })
            .join(',');
          tx.executeSql(
            `replace into tournaments (${fields.join(',')}) values (${placeholders})`,
            [
              item.type,
              moment(item.start).format('YYYY-MM-DDTHH:mm:ss'),
              moment(item.end).format('YYYY-MM-DDTHH:mm:ss'),
              item.uid,
              item.description,
              item.summary
            ],
            (tx, results) => {
              resolve();
            },
            (tx, err) => {
              console.error(err);
              reject(err);
            }
          );
        },
        null,
        err => {
          // success handler
        }
      );
    });
  }

  findItems({ date }) {
    let query;
    if (date) {
      query = [
        'select * from tournaments where start between ? and ? order by start',
        [
          moment(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
          moment(date).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
        ]
      ];
    } else {
      query = ['select * from tournaments order by start', []];
    }
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            ...query,
            (tx, results) => {
              resolve(results.rows._array);
            },
            (tx, err) => {
              console.error(err);
              reject(err);
            }
          );
        },
        null,
        err => {
          // success handler
        }
      );
    });
  }

  findCurrentMonthItems({ date }) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            'select * from tournaments where start between ? and ? order by start',
            [
              moment(date).startOf('month').format('YYYY-MM-DDTHH:mm:ss'),
              moment(date).endOf('month').format('YYYY-MM-DDTHH:mm:ss')
            ],
            (tx, results) => {
              resolve(results.rows._array);
            },
            (tx, err) => {
              console.error(err);
              reject(err);
            }
          );
        },
        null,
        err => {
          // success handler
        }
      );
    });
  }
}
