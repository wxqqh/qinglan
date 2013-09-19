<style type="text/css">
	img {margin: 0 auto;display: inherit; max-width:  600px;max-height: 480px;}	
</style>

# 开发准备 #
--------------------

正如你想的一样，做移动开发环境的搭建有点麻烦。万事开头难，本小节会整理一下所需要的东西，方便环境的部署和工具的调试。

## 硬件 ##
移动开发需要一些额外的东西来进行辅助。

- 一台一开始你可能很兴奋但是最后你会想把它人道毁灭的`Android开发机`。可能某些情况你会需要很多台这样的机子，如[联想A288t][lenvon_a88t]，[Vivo S7][vivo_s7]等

- 一个`无线网卡`，点击[这里][wireless_51]购买

	![无线网卡][img_wireless]

## 软件 ##
+ PC端软件
	
	1. `Fiddler`，一个HTTP/HTTPS的抓包调试工具。可以在[这里][fiddler]进行下载，前端必备工具。但是**不推荐**下载Fiddler4，因为Willow插件貌似还没完全兼容。
	
		![Fiddler][img_fiddler]

		> Linux/Mac 用户可以考虑`Charles`这个跨平台的抓包工具，它一样能出色的完成工作，下载地址在[这里][charles]。如果需要抓AMF的包，Charles是首选的工具，但是它是收费的，呵呵~你懂的。

	2. `Willow`，Fiddler的一个插件，方便配host和代理返回值。
		![Willow][img_willow]

	3. `Android Dev`，Android 的开发环境，环境下载以及搭建（s其中包括[*JDK*][jdk]、[*Eclipse*][eclipse]、[*Android SDK*][android_sdk]、[*ADT*][adt]）可以直接度娘/谷哥。

		![adb][img_adb]

		![DDMS][img_ddms]


	 	> 如果不需要进行Android的开发其实只需要SDK里面*adb工具*和*DDMS*就够了，分别在SDK对应的tools目录和platform-tools目录下面。
	
	4. 无线网卡的驱动，驱动一般在无线网卡包装盒的光盘里面，或者度娘/谷哥。

+ 终端软件 

	1. `AdbWireless`，无线adb工具。AdbWireless可以让PC通过无线网络连接终端进行开发调试。但是要求终端必须**Root**，并且和PC处于**同一子网内**。

		![AdbWireless][img_adbwireless]

		> 当手上的Bug攒到一定程度的时候（Bug数和终端个数是成正比的），此工具会显得不可或缺，因此强烈推荐安装这货。
	
	2. `Proxydroid`，终端上的配代理工具。通过设置这个工具，可以让终端设备上的App走指定的代理，方便进行抓包。同样也要求终端**Root**。

		![Proxydroid][img_proxydroid]

	3. `SQlite Editor`，终端的数据库编辑工具，方便查看App在数据库里写入的值。同样也要求终端**Root**。

		![SQlite Editor][img_sqlite_editor]

	4. `SwiFTP`，终端的FTP工具。可以在终端开FTP，这样子可以方便的在PC上对终端的存储/SDCARD进行操作。

		![SwiFTP][img_swiftp]

		以上终端工具请在**手空**/**手Q**的**AppStore**里搜索进行下载

[adt]: http://developer.android.com.nyud.net/sdk/index.html "ADT"
[android_sdk]: http://developer.android.com.nyud.net/sdk/index.html "Android SDK"
[charles]: http://www.charlesproxy.com/ "Charles -  Web Debugging Proxy  HTTP Monitor / HTTP Proxy / Reverse Proxy"
[eclipse]: http://www.eclipse.org/ "Eclipse"
[fiddler]: http://fiddler2.com/  "Fiddler - The Free Web Debugging Proxy by Telerik"
[jdk]: http://www.oracle.com/technetwork/java/javase/downloads/index.html "JDK"
[lenvon_a88t]: http://baike.baidu.com/view/8592921.htm "百度百科-联想A288t"
[vivo_s7]: http://baike.baidu.com/view/8649760.htm "百度百科-Vivo S7"
[wireless_51]: http://searchex.yixun.com/html?key=%E6%97%A0%E7%BA%BF%E7%BD%91%E5%8D%A1 "易迅-无线网卡"

[img_adb]: ../img/prep-adb.jpg "adb"
[img_adbwireless]: ../img/prep-adbwireless.png "AdbWireless"
[img_ddms]: ../img/prep-ddms.jpg "DDMS"
[img_fiddler]: ../img/prep-fidder.jpg "Fiddler"
[img_proxydroid]: ../img/prep-proxydroid.png "Proxydroid"
[img_sqlite_editor]: ../img/prep-sqlite-editor.png "SQlite"
[img_swiftp]: ../img/prep-swiftp.png "SwiFTP"
[img_willow]: ../img/prep-willow.jpg "Willow"
[img_wireless]: ../img/prep-wireless-network-card.jpg "无线网卡"
