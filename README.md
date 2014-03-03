# WebRTC Distribution
P2P file distribution using WebRTC

## Files
* pingpong/
  * 2-user ping pong test

## Memo
* とりあえず1つのファイルを1人の人から受け取るサンプルを作る
  * ←→ファイルを分割して複数のユーザから受け取り高速読み込みを行う
* 一つのファイルがどれくらい同時に読まれているか
  * 少なかったら意味が無いので，アクセス数の多い画像に限定して使うことになるかも
  * 画像を多くキャッシュしておくかどうか？
    * File System API? 
    * Session Storage?
* ライブラリ
  * Peerjs: P2Pクライアント
  * PeerServer: peerjsの仲介サーバ