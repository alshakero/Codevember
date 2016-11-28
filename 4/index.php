<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "https://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8">
		<meta name="viewport" content="initial-scale=1, maximum-scale=1">
		
		<!-- SEO --> 
		<meta name="keywords" content="Portfolio, Web development, UI design, PHP, Javascript, HTML5, AudioAPI, canvas, drawing">
		<meta name="author" content="Omar Alshaker">
		<meta name="copyright" content="Copyright 2016 - Omar Alshaker" />
 
		<!-- Robots -->
		<meta name="robots" content="index, follow">
		<meta name="location" content="Warsaw, Poland">
		<link rel="icon" type="image/png" href="/images/favicon.ico" />

		<!-- Facebook meta --> 
		<meta property="og:image" content="https://www.omaralshaker.com/images/audio_api_fb_banner.jpg">
		<meta property="og:url" content="https://www.omaralshaker.com/lyricart.php">
		<meta property="og:title" content="Omar Alshaker - LyricArt">
		<meta property="og:sitename" content="Omar Alshaker - LyricArt"/>
		<meta name="description" content="A simple HTML5 AudioAPI experiment"/>

		<!-- Twitter meta -->
		<meta name="twitter:card" content="summary_large_image">
		<meta name="twitter:site" content="@alshakero">
		<meta name="twitter:creator" content="@alshakero">
		<meta name="twitter:title"  content="https://www.omaralshaker.com/lyricart.php">
		<meta name="twitter:description" content="A simple HTML5 AudioAPI experiment">
		<meta name="twitter:image:src" content="https://www.omaralshaker.com/images/audio_api_fb_banner.jpg">

		<!-- GOOGLE + Share -->
		<meta itemprop="name" content="Omar Alshaker - LyricArt">
		<meta itemprop="description" content="A simple HTML5 AudioAPI experiment">
		<meta itemprop="image" content="https://www.omaralshaker.com/images/audio_api_fb_banner.jpg">


		<link href='https://fonts.googleapis.com/css?family=Oswald:700' rel='stylesheet' type='text/css'>
		<link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon">
		<link rel="stylesheet" type="text/css" href="css/lyricart.css" />
		<title>Omar Alshaker - LyricArt: A simple HTML5 AudioAPI experiment</title>
	</head>
	<body>	
		<div id="fb-root"></div>
		<script>(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) return;
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.6&appId=310615612606985";
		fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));</script>
		<div id="like-btn">
			<div class="fb-like" data-href="https://omaralshaker.com/lyricart.php" data-layout="button" data-action="like" data-size="small" data-show-faces="true" data-share="true"></div>
		</div>
			<canvas id="screen" onclick="startGame()"></canvas>
			<canvas id="stars"></canvas>
		</div>

		<script src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="js/lyricart.max.js"></script>

		<div id="controls">Omar Alshaker- 2016 | audio <a target='_blank' href="https://www.youtube.com/watch?v=R9CD7uj2TL0"> from here</a></p>

		<script>
		  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

		  ga('create', 'UA-56638680-2', 'auto');
		  ga('send', 'pageview');

		</script>
	</body>
</html>