'use strict';
const fs = require('fs'); // fs(file system)モジュールを読み込んで使えるようにする
const readline = require('readline'); // readlineモジュールを読み込んで使えるようにする
const rs = fs.createReadStream('./popu-pref.csv'); // 既存のcsvを読み込める状態にする
const rl = readline.createInterface({ input: rs, output: {} }); // csvを読み込む設定ができた変数rsをreadlne.createInterfaceのinputに設定してrlに代入。outputは空でいい（データとして書き出さないので）
const prefectureDataMap = new Map(); // key:都道府県 value:集計データのオブジェクト
rl.on('line', lineString => { // 1行ずつ読み込んで設定された関数を実行する->lineStringがcsvの1行1行を読み込む関数。Event:'line'は1行1行を読み込んだ時の処理を実行する　
    const columns = lineString.split(','); // "2010[0],北海道[1],237155[2],258530[3]"のようにカンマで区切る
    const year = parseInt(columns[0]); // 上の[0]の文字列を数値型に変換
    const prefecture = columns[1]; // prefectureに都道府県名を代入
    const popu = parseInt(columns[3]); // 上の[3]の文字列を数値型に変換
    // console.log(year + "" + prefecture + "" + popu + "");
    if (year === 2010 || year === 2015){ // 2010と2015を対象にする
        let value = prefectureDataMap.get(prefecture); // データをゲットしてくる
        if (!value){ // データがなかったらデータを初期化（popu10などのプロパティだけを作り、中は空にしておく）-> 0 ,0, null
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        // この下は実はいらない、ほかの年のデータがもともとないから
        if (year === 2010){
            value.popu10 = popu; //2010年だったらpopu10に代入
        }
        if (year === 2015){
            value.popu15 = popu; //2015年だったらpopu15に代入
        }
        prefectureDataMap.set(prefecture, value); //prefectureDataMapにデータをセット
    }
});
rl.on('close', () => {
    for (let [key, data] of prefectureDataMap){ //prefectureDataMapの数だけ繰り返して変化率を算出。上の処理ですべてのデータがそろった後なのでcloseの中でやる。それをfor文でぐるぐる回していく、'value'は上で使っているのとカブるのでdataに変更
        data.change = data.popu15 / data.popu10;
    }
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => { //Array.from~:Map型を配列型に変えて(Sort関数を使うため)、並べ替えをする
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => { //連想配列のMapとは別の、map関数というもの（要注意）
        return (
            key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change
        );
    });
    console.log(rankingStrings);
});
