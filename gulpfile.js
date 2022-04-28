/*
	Перед использованием gulp'a отключить в браузере кеширование файлов

	Окно разработчика (просмотр кода элемента) -> Вкладка Network -> Поставить галочку Disable cache
*/

var gulp 			= require("gulp"),
	sass 			= require("gulp-sass")(require('sass')),
	browserSync 	= require("browser-sync"),
	concat 			= require("gulp-concat"),
	autoprefixer 	= require("gulp-autoprefixer"),
	del 			= require("del"),
	rename 			= require("gulp-rename"),
	fs 				= require("fs"),
	map 			= require("map-stream"),
	fontforge 		= require("fontforge"),
	convertFont 	= require("gulp-ttf2woff2"),
	minCss			= require("gulp-clean-css"),
	minJs			= require("gulp-uglify"),
	newer 			= require("gulp-newer"),
	responsive		= require("gulp-responsive");

var donePath = {
	css: "done/css",
	js: "done/js",
	img1: "done/img/@1x",
	img2: "done/img/@2x",
	files: "done/",
	fonts: "done/fonts",
	video: "done/video",
	html: "done/"
};

gulp.task("browser", done => {
	// console.log("Делаем вид, как будто открывается окно браузера...");

	browserSync({
		server: {
			baseDir: "done"
		},
		notify: false
	});

	done();
});

function reloadBrowser() {
	browserSync.reload();
}

gulp.task("styles", done => {
	gulp.src("site/sass/main.sass")
		.pipe(sass({
			outputStyles: "expanded",
			includePaths: [__dirname + "/node_modules"]
		}).on("error", err => {
			console.error("Произошла ошибка с преобразованием из sass в css! Подробности:");
			console.error(err);
			done();
		}))
		.pipe(concat("styles.css")
			.on("error", err => {
				console.error("Произошла ошибка с слиянием файлов css! Подробности:");
				console.error(err);
				done();
			})
		)
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 50 versions"]
		}).on("error", err => {
			console.error("Произошла ошибка с автопрефиксами в css! Подробности:");
			console.error(err);
			done();
		}))
		.pipe(minCss()
			.on("error", err => {
				console.error("Произошла ошибка с минификацией css! Подробности:");
				console.error(err);
				done();
			})
		)
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: styles. Подробности:");
			console.error(err);
		})
		.pipe(gulp.dest(donePath.css))
		.pipe(browserSync.stream());
		
	done();
});

gulp.task("scripts", done => {
	gulp.src("site/js/**/*.js")
		.pipe(concat("scripts.js")
			.on("error", err => {
				console.error("Произошла ошибка с слиянием файлов js! Подробности:");
				console.error(err);
				done();
			})
		)
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp аварийно остановлен. Мониторинг: scripts. Подробности:");
			console.error(err);
		})
		.pipe(gulp.dest(donePath.js))
		.pipe(browserSync.stream());
		
	done();
});

gulp.task("html", done => {
	gulp.src("done/**/*.html")
		.pipe(newer("./**/*.html")
			.on("error", err => {
				console.error("Произошла ошибка с фильтром файлов html. Подробности:");
				console.error(err);
				done();
			})
		)
		.pipe(map(file => {
			let pathSite = "site\\";
			let pathDone = "done\\";

			fs.access(pathSite + file.relative, async err => {
				if (err) await del([pathDone + file.relative]);
			});
		}).on("error", err => {
			console.error("Произошла ошибка с удалением файлов с папки site! Мониторинг: html. Подробности:");
			console.error(err);
			done();
		}))
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: html. Подробности:");
			console.error(err);
		});

	gulp.src("site/**/*.html")
		.pipe(gulp.dest(donePath.html))
		.pipe(browserSync.stream());
		
	done();
});

gulp.task("files", done => {
	var remove = false;

	gulp.src(["done/**/*.*", "!done/{js,css,img,fonts}/**/*.*", "!done/**/*.{css,sass,js,html,png,jpg,webp,raw,jpeg,jp2,ttf,svg,gif,avi,wmv,mov,mkv,3gp,mp4,mpeg,mpg,webm,mov}"])
		.pipe(newer("!./**/*.{css,sass,js,html,png,jpg,webp,raw,jpeg,jp2,ttf,svg,gif,avi,wmv,mov,mkv,3gp,mp4,mpeg,mpg,webm,mov}")
			.on("error", err => {
				console.error("Произошла ошибка с фильтром файлов files. Подробности:");
				console.error(err);
				done();
			})
		)
		.pipe(map(file => {
			let pathSite = "site\\";
			let pathDone = "done\\";

			fs.access(pathSite + file.relative, async err => {
				if (err) await del([pathDone + file.relative]);
			});
		}).on("error", err => {
			console.error("Произошла ошибка с удалением файлов с папки site! Мониторинг: files. Подробности:");
			console.error(err);
			done();
		}))
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: files. Подробности:");
			console.error(err);
		});

	gulp.src(["site/**/*.*", "!site/**/*.{sass,js,html,png,jpg,webp,raw,jpeg,jp2,ttf,svg,gif,avi,wmv,mov,mkv,3gp,mp4,mpeg,mpg,webm,mov}"])
		.pipe(gulp.dest(donePath.files))
		.pipe(browserSync.stream());
		
	done();
});

gulp.task("images-responsive-1", async done => {
	gulp.src("site/img/**/*.{png,jpg,jpeg,webp,raw}")
		.pipe(newer("done/img/@1x/**/*.{png,jpg,jpeg,webp,raw}")
			.on("error", err => {
				console.error("Произошла ошибка с фильтром файлов images-responsive-1. Этап 1. Подробности:");
				console.error(err);
				done();
			})
		)
		.pipe(responsive({
			"**/*": {
				width: '50%',
				quality: 70
			}
		}).on("error", err => {
			console.error("Произошла ошибка с сжатием изображением для мобильных версии. Подробности:");
			console.error(err);
			done();
		}))
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: images-responsive-1. Подробности:");
			console.error(err);
		})
		.pipe(gulp.dest(donePath.img1));

	gulp.src("site/img/**/*.{svg,jp2,gif}")
		.pipe(newer("done/img/@1x/**/*.{svg,jp2,gif}")
			.on("error", err => {
				console.error("Произошла ошибка с фильтром файлов images-responsive-1. Этап 2. Подробности:");
				console.error(err);
				done();
			})
		)
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: images-responsive-1. Подробности:");
			console.error(err);
		})
		.pipe(gulp.dest(donePath.img1));

	done();
});

gulp.task("images-responsive-2", async done => {
	gulp.src("site/img/**/*.{png,jpg,jpeg,webp,raw}")
		.pipe(newer("done/img/@2x/**/*.{png,jpg,jpeg,webp,raw}")
			.on("error", err => {
				console.error("Произошла ошибка с фильтром файлов images-responsive-2. Этап 1. Подробности:");
				console.error(err);
				done();
			})
		)
		.pipe(responsive({
			"**/*": {
				width: '100%',
				quality: 50
			}
		}).on("error", err => {
			console.error("Произошла ошибка с сжатием изображением для компьютерных версии. Подробности:");
			console.error(err);
			done();
		}))
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: images-responsive-2. Подробности:");
			console.error(err);
		})
		.pipe(gulp.dest(donePath.img2));

	gulp.src("site/img/**/*.{svg,jp2,gif}")
		.pipe(newer("done/img/@2x/**/*.{svg,jp2,gif}")
			.on("error", err => {
				console.error("Произошла ошибка с фильтром файлов images-responsive-2. Этап 2. Подробности:");
				console.error(err);
				done();
			})
		)
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: images-responsive-2. Подробности:");
			console.error(err);
		})
		.pipe(gulp.dest(donePath.img2));

	done();
});

gulp.task("images", gulp.series("images-responsive-1", "images-responsive-2", reloadBrowser));

gulp.task("video", done => {
	gulp.src("done/video/**/*")
		.pipe(map(file => {
			let pathVid = "site\\video\\";
			let pathDoneVid = "done\\video\\";

			fs.access(pathVid + file.relative, async err => {
				if (err) await del([pathDoneVid + file.relative]);
			});
		}).on("error", err => {
			console.error("Произошла ошибка с удалением файлов с папки site! Мониторинг: video. Подробности:");
			console.error(err);
			done();
		}))
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Этап: 1. Мониторинг: video. Подробности:");
			console.error(err);
		});

	gulp.src("site/video/**/*.{avi,wmv,mov,mkv,3gp,mp4,mpeg,mpg,webm,mov}")
		.pipe(newer("done/video/**/*.{avi,wmv,mov,mkv,3gp,mp4,mpeg,mpg,webm,mov}")
			.on("error", err => {
				console.error("Произошла ошибка с фильтром файлов video. Подробности:");
				console.error(err);
				done();
			})
		).on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Этап: 2. Мониторинг: video. Подробности:");
			console.error(err);
		})
		.pipe(gulp.dest(donePath.video))
		.pipe(browserSync.stream());

	reloadBrowser();
	done();
});

gulp.task("fonts", done => {
	gulp.src("done/fonts/**/*")
		.pipe(map(file => {
			let pathTTF = "site\\fonts\\";
			let pathWOFF = "done\\fonts\\";
			let fileTTF = file.relative.replace(file.extname, "") + ".ttf";
			let type = "";

			if (file.relative.endsWith(".woff2")) type = pathTTF + fileTTF;
			else type = pathTTF + file.relative;

			fs.access(type, async err => {
				if (err) await del([pathWOFF + file.relative]);
			});
		}).on("error", err => {
			console.error("Произошла ошибка с удалением файлов с папки site! Мониторинг: fonts. Подробности:");
			console.error(err);
			done();
		}))
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: fonts. Этап: 2. Подробности:");
			console.error(err);
		});

	gulp.src("site/fonts/**/*.ttf")
		.pipe(newer("done/fonts/**/*.woff2")
			.on("error", err => {
				console.error("Произошла ошибка с фильтром файлов fonts. Подробности:");
				console.error(err);
				done();
			})
		)
		.pipe(convertFont()
			.on("error", err => {
				console.error("Произошла ошибка с коветированием шрифтов из ttf в woff2! Подробности:");
				console.error(err);
				done();
			})
		)
		.on("error", err => {
			console.error("Произошла неизвестная ошибка! Gulp был аварийно остановлен. Мониторинг: fonts. Этап: 2. Подробности:");
			console.error(err);
		})
		.pipe(gulp.dest(donePath.fonts))
		.pipe(browserSync.stream());
		
	done();
});

gulp.task("watch", () => {
	gulp.watch("site/sass/**/*.sass", gulp.parallel("styles"));
	gulp.watch("site/js/**/*.js", gulp.parallel("scripts"));
	gulp.watch("site/**/*.html", gulp.parallel("html"));
	gulp.watch(["site/**/*.*", "!site/**/*.{sass,js,html,png,jpg,webp,raw,jpeg,jp2,ttf,svg,gif,avi,wmv,mov,mkv,3gp,mp4,mpeg,mpg,webm,mov}"], gulp.parallel("files"));
	gulp.watch("site/img/**/*.{png,jpg,jpeg,webp,raw,svg,jp2,gif}", gulp.parallel("images"));
	gulp.watch("site/video/**/*.{avi,wmv,mov,mkv,3gp,mp4,mpeg,mpg,webm,mov}", gulp.parallel("video"));
	gulp.watch("site/fonts/**/*.ttf", gulp.parallel("fonts"));
});

gulp.task("default", gulp.parallel("images", "video", "styles", "scripts", "html", "files", "browser", "watch"));