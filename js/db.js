import Expo, { SQLite } from 'expo';
import moment from 'moment';

export default class Database {
  constructor() {
    this.db = SQLite.openDatabase({ name: 'db.db' });
    this.db.transaction(tx => {
      tx.executeSql(
        'create table if not exists tournaments (uid text primary key not null, type text, start text, end text, description text, summary text);'
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
              item.start,
              item.end,
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
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            'select * from tournaments where start between ? and ? order by start',
            [moment(date).startOf('day'), moment(date).endOf('day')],
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
