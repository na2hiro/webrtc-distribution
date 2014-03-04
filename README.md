# WebRTC Distribution
P2P file distribution using WebRTC

## Directories
### pingpong
2-user ping pong test. idを入力する必要があるのは複数の人が同じidを名乗るとマズいからです．

1. pinger.htmlを開く
2. idをコピる
3. ponger.htmlを開く
4. idをペる
5. ピンポン開始

### pingpong-with-server
2-user ping pong test with local server. ローカルサーバを使用し，connectionとdisconnectイベントは取ることができる(それ以外は何も出来ない？)

1. 予め`npm install peer`しておく
2. `node server.js`でサーバ起動
3. pinger.htmlを開く
4. ponger.htmlを開く

### transfer-image
transfer files in sender-receiver style

1. `node server.js`でサーバ起動
2. sender.htmlを開き画像を選択
3. receiver.htmlを開くと送られる

#### バイナリデータの流れ
1. `<input type="file">`で選択され，`File`オブジェクトになる
2. `File#slice()`で`Blob`オブジェクトになる
3. `Blob`はPeerJSで送信可能
4. `ArrayBuffer`で受信
5. `new Blob([arrayBuffer])`で`Blob`オブジェクトになる
6. `URL.createObjectURL(obj)`でURLが得られる
7. `img.src`に設定

### simple-distribution
1つの画像を配る

1. `node server.js`
2. superuser.htmlを開き画像を選択する
3. client.htmlを開くと生きてる人たちから送られる
4. 何度でも

## Memo
* とりあえず1つのファイルを1人の人から受け取るサンプルを作る → pingpong
	* ←→ファイルを分割して複数のユーザから受け取り高速読み込みを行う
* 一つのファイルがどれくらい同時に読まれているか
	* 少なかったら意味が無いので，アクセス数の多い画像に限定して使うことになるかも
		* サイト表示中は保持しておくことにすると，滞在時間中に他の人が表示するくらいの頻度で閲覧されている画像だと良い
	* 画像を多くキャッシュしておくかどうか？
		* File System API? 
		* Session Storage?
* 画像の転送
	* 最新のFirefox, Chromeではバイナリ(Blob)を送信可能
	* imgからBlobを作り出すことはできない?(Canvas経由)
		* File, WebSocket, WebRTC, XHRのバイナリからは作成可能
		
### サーバとのやりとり
誰がその画像を持っているかをサーバが把握するか，申告してもらう機構が必要

* そもそもどうやってサーバとクライアントがやりとりするのか？
	* [auth目的のpreprocessのissue](https://github.com/peers/peerjs-server/pull/10)はあるがまだ実装されていない
* WebSocket貼る必要ありそう
		
### 画像頒布戦略
* simple
	* peerとsocketの生存タイミングは同時と仮定
	* WebSocketでサーバにほしい画像idを送る(WS →ids 画像ID)
	* 誰かが持っている場合，数人のidを受け取って彼らから貰う(WS ←ids 画像ID, ピアID)
		* 時間がかかったり断られたりしたら順に試す
	* {誰も持ってなかったら/n秒以内に誰からも貰えなかったら}サーバから貰う (WS →raw ←raw)
	* 無事得られたら送信者になる(WS →ready ピアID, 画像ID)
	* ページ遷移しないで表示できるUI
		* 頻繁にページ遷移されると送っている最中に切断されることが多発しそうなため
		* デイリーランキング等表示するものが決まっているもの？
* 改ざん防止
	* 画像のハッシュを予めとっておく
	* 受信者に送信者idとハッシュを送る
	* 送信者から得た画像のハッシュをとり確かめてから表示する
	* 怪しいデータを送る人を報告？
    
## Libraries
* [Peerjs](https://github.com/peers/peerjs): P2Pクライアント
	* 今回はこれを使用
	* WebSocket, XHRにフォールバックする
* [PeerServer](https://github.com/peers/peerjs-server): peerjsの仲介サーバ
	* 今のところpeerjs.comが提供しているクラウド(最大50ピアまで)を使用
* [EasyRTC](http://easyrtc.com/)
	* エンタプライズだとAndroid/iOS SDKがある
	* ルーム機能
* [webRTC.io](https://github.com/webRTC/webRTC.io)
	* 1年間更新がない
	* ルーム機能

## References
* [FileとWebの関係をもっと知る Blob, FileそしてFileSystem API](https://docs.google.com/presentation/d/1zwNaA0N7SNaIRc3rckEb_bSBsfWCw4Yg-UQgjgWRoVI/present#slide=id.i0): バイナリの扱い
* [PeerCDN](https://peercdn.com/): WebRTCを用いたP2Pコンテンツ頒布サービス
	* 最近Yahooに買収されたらしい
	* Graceful fallback, ピアが少なければ通常の配布, SHA1ハッシュによる改ざん防止, 暗号化通信, P2P遅ければ通常の取得など
	* 理想に近い