/*
	Перед использованием gulp'a отключить в браузере кеширование файлов

	Окно разработчика (просмотр кода элемента) -> Вкладка Network -> Поставить галочку Disable cache
*/

var gulp 			= require("gulp"),
	//MG plugin begin: @sass = "Преобразователь в CSS"
	sass 			= require("gulp-sass"),
	//MG plugin end
	//MG plugin begin: @browserSync = "Обновления браузера"
	browserSync 	= require("browser-sync"),
	//MG plugin end
	//MG plugin begin: @concat = "Совмещение файлов в единую"
	concat 			= require("gulp-concat"),
	//MG plugin end
	//MG plugin begin: @autoprefixer = "Автопрефиксер CSS"
	autoprefixer 	= require("gulp-autoprefixer"),
	//MG plugin end
	//MG plugin begin: @map! = "Доступ к файловой системе"
	map 			= require("map-stream"),
	//MG plugin end
	//MG plugin begin: @fs -> map = "Файловая система"
	fs 				= require("fs"),
	//MG plugin end
	//MG plugin begin: @del -> map = "Удаление файлов"
	del 			= require("del"),
	//MG plugin end
	//MG plugin begin: @rename = "Переименование файлов"
	rename 			= require("gulp-rename"),
	//MG plugin end
	//MG plugin begin: @fontforge! = "Библиотека шрифтов"
	fontforge 		= require("fontforge"),
	//MG plugin end
	//MG plugin begin: @convertFont -> fontforge = "Конвертация из ttf в woff2"
	convertFont 	= require("gulp-ttf2woff2");
	//MG plugin end

var donePath = {
	css: "done/css",
	js: "done/js",
	img: "done/img",
	files: "done/",
	fonts: "done/fonts",
	html: "done/"
};

//MG monitoring begin: @browser = "Обновление браузера"
gulp.task("browser", done => {
	// console.log("Делаем вид, как будто открывается окно браузера...");

	//MG plugin begin: browserSync
	browserSync({
		server: {
			baseDir: "done"
		},
		notify: false
	});
	//MG plugin end

	done();
});
//MG monitoring end

//MG plugin begin: browserSync
function reloadBrowser() {
	browserSync.reload();
}
//MG plugin end

//MG monitoring begin: @styles = "SASS/CSS"
gulp.task("styles", done => {
	gulp.src("site/sass/main.sass")
		//MG plugin begin: sass
		.pipe(sass({
			outputStyles: "expanded",
			includePaths: [__dirname + "/node_modules"]
		}))
		//MG plugin end
		//MG plugin begin: concat
		.pipe(concat("styles.css"))
		//MG plugin end
		//MG plugin begin: autoprefixer
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 10 versions"]
		}))
		//MG plugin end
		.on("error", err => {
			console.error(err);
		})
		.pipe(gulp.dest(donePath.css))
		//MG plugin begin: browserSync
		.pipe(browserSync.stream());
		//MG plugin end

	done();
});
//MG monitoring end

//MG monitoring begin: @scripts = "JavaScript"
gulp.task("scripts", done => {
	gulp.src("site/js/**/*.js")
		//MG plugin begin: concat
		.pipe(concat("scripts.js"))
		//MG plugin end
		.on("error", err => {
			console.error(err);
		})
		.pipe(gulp.dest(donePath.js))
		//MG plugin begin: browserSync
		.pipe(browserSync.stream());
		//MG plugin end

	done();
});
//MG monitoring end

//MG monitoring begin: @html = "HTML"
gulp.task("html", done => {
	gulp.src("done/**/*.html")
		//MG plugin begin: map
		.pipe(map(file => {
			let pathSite = "site\\";
			let pathDone = "done\\";

			//MG plugin begin: fs
			fs.access(pathSite + file.relative, async err => {
				//MG plugin begin: del
				if (err) await del([pathDone + file.relative]);
				//MG plugin end
			});
			//MG plugin end
		}))
		//MG plugin end
		.on("error", err => {
			console.error(err);
		});

	gulp.src("site/**/*.html")
		.pipe(gulp.dest(donePath.html))
		//MG plugin begin: browserSync
		.pipe(browserSync.stream());
		//MG plugin end

	done();
});
//MG monitoring end

//MG monitoring begin: @files = "Иные файлы"
gulp.task("files", done => {
	var remove = false;

	gulp.src(["done/**/*.*", "!done/{js,css,img,fonts}/**/*.*", "!done/**/*.{js,css,html}"])
		//MG plugin begin: map
		.pipe(map(file => {
			let pathSite = "site\\";
			let pathDone = "done\\";

			//MG plugin begin: fs
			fs.access(pathSite + file.relative, async err => {
				//MG plugin begin: del
				if (err) await del([pathDone + file.relative]);
				//MG plugin end
			});
			//MG plugin end
		}))
		//MG plugin end
		.on("error", err => {
			console.error(err);
		});

	gulp.src(["site/**/*.*", "!site/**/*.{sass,js,html,png,jpg,webp,raw,jpeg,ttf,svg}"])
		.pipe(gulp.dest(donePath.files))
		//MG plugin begin: browserSync
		.pipe(browserSync.stream());
		//MG plugin end

	done();
});
//MG monitoring end

//MG monitoring begin: @images = "Изображения"
gulp.task("images", done => {
	gulp.src("done/img/**/*")
		//MG plugin begin: map
		.pipe(map(file => {
			let pathImg = "site\\img\\";
			let pathDoneImg = "done\\img\\";

			//MG plugin begin: fs
			fs.access(pathImg + file.relative, async err => {
				//MG plugin begin: del
				if (err) await del([pathDoneImg + file.relative]);
				//MG plugin end
			});
			//MG plugin end
		}))
		//MG plugin end
		.on("error", err => {
			console.error(err);
		});

	gulp.src("site/img/**/*.jpeg")
		//MG plugin begin: rename
		.pipe(rename(path => {
			rename();

			async function rename() {
				let fullPath = "";
				let beforeExt = path.extname;

				if (path.dirname != ".") fullPath = "site\\img\\" + path.dirname + "\\"+ path.basename + beforeExt;
				else fullPath = "site\\img\\" + path.basename + beforeExt;
				path.extname = path.extname.replace("jpeg", "jpg");

				//MG plugin begin: del
				if (beforeExt == ".jpeg") await del([fullPath]);
				//MG plugin end
			}

			return;
		}))
		//MG plugin end
		.on("error", err => {
			console.error(err);
		})
		.pipe(gulp.dest("site/img"))
		.pipe(gulp.dest(donePath.img));

	gulp.src("site/img/**/*.{png,jpg,webp,raw}")
		.pipe(gulp.dest(donePath.img))
		//MG plugin begin: browserSync
		.pipe(browserSync.stream());
		//MG plugin end

	//MG plugin begin: browserSync
	reloadBrowser();
	//MG plugin end
	done();
});
//MG monitoring end

//MG monitoring begin: @fonts = "Шрифты"
gulp.task("fonts", done => {
	gulp.src("done/fonts/**/*")
		//MG plugin begin: map
		.pipe(map(file => {
			let pathTTF = "site\\fonts\\";
			let pathWOFF = "done\\fonts\\";
			let fileTTF = file.relative.replace(file.extname, "") + ".ttf";
			let type = "";

			if (file.relative.endsWith(".woff2")) type = pathTTF + fileTTF;
			else type = pathTTF + file.relative;

			//MG plugin begin: fs
			fs.access(type, async err => {
				//MG plugin begin: del
				if (err) await del([pathWOFF + file.relative]);
				//MG plugin end
			});
			//MG plugin end
		}))
		//MG plugin end
		.on("error", err => {
			console.error(err);
		});

	gulp.src("site/fonts/**/*.ttf")
		//MG plugin begin: convertFont
		.pipe(convertFont())
		//MG plugin end
		.on("error", err => {
			console.error(err);
		})
		.pipe(gulp.dest(donePath.fonts))
		//MG plugin begin: browserSync
		.pipe(browserSync.stream());
		//MG plugin end

	done();
});
//MG monitoring end

gulp.task("watch", () => {
	//MG monitoring begin: styles
	gulp.watch("site/sass/**/*.sass", gulp.parallel("styles"));
	//MG monitoring end
	//MG monitoring begin: scripts
	gulp.watch("site/js/**/*.js", gulp.parallel("scripts"));
	//MG monitoring end
	//MG monitoring begin: html
	gulp.watch("site/**/*.html", gulp.parallel("html"));
	//MG monitoring end
	//MG monitoring begin: files
	gulp.watch(["site/**/*.*", "!site/**/*.{sass,js,html,png,jpg,webp,raw,jpeg,ttf,svg}"], gulp.parallel("files"));
	//MG monitoring end
	//MG monitoring begin: images
	gulp.watch("site/img/*", gulp.parallel("images"));
	//MG monitoring end
	//MG monitoring begin: fonts
	gulp.watch("site/fonts/*.ttf", gulp.parallel("fonts"));
	//MG monitoring end
});

gulp.task("default", gulp.parallel(
	//MG monitoring begin: images
	"images", 
	//MG monitoring end
	//MG monitoring begin: styles
	"styles", 
	//MG monitoring end
	//MG monitoring begin: scripts
	"scripts", 
	//MG monitoring end
	//MG monitoring begin: browser
	"browser", 
	//MG monitoring end
	"watch"
));