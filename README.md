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
1つの画像を配る．superuserが最初に提供できる．

1. `node server.js`
2. superuser.htmlを開き画像を選択する
3. client.htmlを開くと生きてる人たちから送られる
4. superuserがいなくても，何度でも

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
* ✓画像が受け取れない事例
	* ✓peerに接続できない(直前に去った)
		* noisyserver.jsはノイズ(ダミー)ピアIDを混ぜて送る
		* peerにつながらないエラーはDataConnection#on('error')ではなくPeer#on('error')で来る
			* peerid=>imageidテーブルを保持
		* 結果: 1ノイズピアごとにエラーが出るまで5秒ほど経過する
			* →早めにタイムアウトしたほうが良さそう(→接続前タイムアウト)
	* ✓peerに接続できたがなかなか送られてこない(→接続後タイムアウト)
		* slowclient.htmlはデータをなかなか送らない
* ✓タイムアウト
	* 接続前
		* 発生時: peer.connect
		* 撤回時: conn.on("open")
	* 接続後
		* 発生時: conn.on("open")
		* 撤回時: conn.on("data")
* **複数画像(ランキングページそのもので使用)**
	* idとともに送って判別
	* 複数人から貰う
		* 早い人に多く送ってもらう？
* ✓画像を持っている人が誰もいない(→サーバが直接送る)
	* いろいろハマった 
	* Peer.jsのnodejsクライアントはない
	* Socket.ioはバイナリを送信できない
		* 妥協案でBase64にしてSocket.ioで送るように

### 画像頒布戦略(できたらやる)
* 速度
	* socket接続開始時にRound Trip Timeを計測し活用
	* 複数のidに同時に接続し一番早い人から貰う？
* 改ざん防止
	* 画像のハッシュを予めとっておく
	* 受信者に送信者idとハッシュを送る
	* 送信者から得た画像のハッシュをとり確かめてから表示する
	* 怪しいデータを送る人を報告？
	
### バッチ
* crawler.js: ランキングページからHTMLを取って来てranking.htmlに書く
* extractImageIds: ranking.htmlから画像URLを抜き出しJSファイルにし，画像をpublicにDL
    
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
* [md5.js](http://blog.faultylabs.com/?d=md5)

## References
* [FileとWebの関係をもっと知る Blob, FileそしてFileSystem API](https://docs.google.com/presentation/d/1zwNaA0N7SNaIRc3rckEb_bSBsfWCw4Yg-UQgjgWRoVI/present#slide=id.i0): バイナリの扱い
* [PeerCDN](https://peercdn.com/): WebRTCを用いたP2P CDN(コンテンツ頒布ネットワーク)
	* 最近Yahooに買収されたらしい
	* Graceful fallback, ピアが少なければ通常の配布, SHA1ハッシュによる改ざん防止, 暗号化通信, P2P遅ければ通常の取得など
	* 理想に近い
* [P2Pコンテンツ配信ネットワークシステムの検討および実装](http://biblio.yamanaka.ics.keio.ac.jp/file/pnws_0803_tsuji.pdf): P2P CDNの検討
	* サーバとのRTT(Round Trip Time)の短い順を提示(接続数制限)