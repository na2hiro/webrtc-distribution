# WebRTC Distribution
P2P file distribution using WebRTC

## Files
### pingpong/
2-user ping pong test

1. pinger.htmlを開く
2. idをコピる
3. ponger.htmlを開く
4. idをペる
5. ピンポン開始

### pingpong-with-server
2-user ping pong test with server

## Memo
* とりあえず1つのファイルを1人の人から受け取るサンプルを作る
	* ←→ファイルを分割して複数のユーザから受け取り高速読み込みを行う
* 誰がその画像を持っているかをサーバが把握するか，申告してもらう機構が必要
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
	* 最新のFirefox, Chromeではバイナリを送信可能
    
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