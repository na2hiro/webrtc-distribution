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

## Memo
* とりあえず1つのファイルを1人の人から受け取るサンプルを作る
	* ←→ファイルを分割して複数のユーザから受け取り高速読み込みを行う
* 一つのファイルがどれくらい同時に読まれているか
	* 少なかったら意味が無いので，アクセス数の多い画像に限定して使うことになるかも
		* サイト表示中は保持しておくことにすると，滞在時間中に他の人が表示するくらいの頻度で閲覧されている画像だと良い
	* 画像を多くキャッシュしておくかどうか？
		* File System API? 
		* Session Storage?
* 改ざん防止
	* hashを付加することで怪しい画像は表示しないようにする
	* 怪しい画像をよく送っている人を記録する
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
	* 同じ画像を見ている人がいたらその人たちから貰う
	* 頻繁にページ遷移されると送っている最中に切断されることが多発しそう
		* ViewをAjax遷移にする必要あり？
		* デイリーランキング等表示するものが決まっているものについてはページ遷移なしで1ページで表示できるようにする？
    
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