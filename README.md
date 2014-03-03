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
    
## ライブラリ
* Peerjs: P2Pクライアント
* PeerServer: peerjsの仲介サーバ
	* 今のところpeerjs.comが提供しているクラウド(最大50ピアまで)を使用