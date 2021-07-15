var gulp 			= require("gulp"),
	sass 			= require("gulp-sass"),
	browserSync 	= require("browser-sync"),
	concat 			= require("gulp-concat"),
	autoprefixer 	= require("gulp-autoprefixer"),
	del 			= require("del"),
	rename 			= require("gulp-rename"),
	fs 				= require("fs"),
	map 			= require("map-stream"),
	fontforge 		= require("fontforge"),
	convertFont 	= require("gulp-ttf2woff2");

var donePath = {
	css: "done/css",
	js: "done/js",
	img: "done/img",
	files: "done/",
	fonts: "done/fonts",
	html: "done/"
};

gulp.task("browser-sync", function(done) {
	// console.log("Делаем вид, как будто открывается окно браузера...");
	browserSync({
		server: {
			baseDir: "done"
		},
		notify: false,
	});

	done();
});

function bsReload(done) {
	browserSync.reload();

	done();
}

gulp.task("styles", function(done) {
	gulp.src("site/sass/**/main.sass")
		.pipe(sass({
			outputStyles: "expanded",
			includePaths: [__dirname + "/node_modules"]
		}))
		.pipe(concat("styles.css"))
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 10 versions"]
		}))
		.on("error", (err) => {
			console.error(err);
		})
		.pipe(gulp.dest(donePath.css))
		.pipe(browserSync.stream());

	done();
});

gulp.task("scripts", function(done) {
	gulp.src("site/js/**/*.js")
		.pipe(concat("scripts.js"))
		.on("error", (err) => {
			console.error(err);
		})
		.pipe(gulp.dest(donePath.js))
		.pipe(browserSync.reload({
			stream: true
		}));

	done();
});

gulp.task("images-other", function(done) {
	gulp.src("site/img/**/*.{png,jpg,webp,raw}")
		.pipe(gulp.dest(donePath.img))

	done();
});

gulp.task("images-rename", function(done) {
	gulp.src("site/img/**/*.jpeg")
		.pipe(rename(function(path) {
			renameJpeg(path);
			return; //return обязателен!
		}))
		.on("error", (err) => {
			console.error(err);
		})
		.pipe(gulp.dest("site/img"))
		.pipe(gulp.dest(donePath.img))

	done();
});

async function renameJpeg(path) {
	let fullPath = "";
	let beforeExt = path.extname;

	if (path.dirname != ".") fullPath = "site\\img\\" + path.dirname + "\\"+ path.basename + beforeExt;
	else fullPath = "site\\img\\" + path.basename + beforeExt;
	path.extname = path.extname.replace("jpeg", "jpg");

	if (beforeExt == ".jpeg") await del([fullPath]);
}

gulp.task("images-clean", function(done) {
	gulp.src("done/img/**/*")
		.pipe(map((file) => {
			let pathImg = "site\\img\\";
			let pathDoneImg = "done\\img\\";

			fs.access(pathImg + file.relative, async (err) => {
				if (err) await del([pathDoneImg + file.relative]);
			});
		}))
		.on("error", (err) => {
			console.error(err);
		});

	done();
});

gulp.task("images", gulp.series("images-clean", "images-rename", "images-other", bsReload));

gulp.task("files-update", function(done) {
	var doDest;

	gulp.src("site/**/*.*")
		.pipe(map(function(file) {
			var ext = fs.extname;
			if (ext == ".sass" || ext == ".js" || ext == ".png" || ext == ".jpg" || ext == ".html" ||
				ext == ".webp" || ext == ".raw" || ext == ".jpeg" || ext == ".ttf") doDest = false;
			else doDest = true;
		}))
		.pipe(doDest ? gulp.dest(donePath.files) : map(function(file) {}));

	done();
});

gulp.task("files-clean", function(done) {
	var doDest;

	gulp.src("done/**/*.*")
		.pipe(map(function(file) {
			var ext = fs.extname;

			if (ext == ".sass" || ext == ".js" || ext == ".png" || ext == ".jpg" || ext == ".html" ||
				ext == ".webp" || ext == ".raw" || ext == ".jpeg" || ext == ".ttf" ) {

				let pathSite = "site\\";
				let pathDone = "done\\";

				fs.access(pathSite + file.relative, async (err) => {
					if (err) await del([pathDone + file.relative]);
				});
			}
		}))
		.on("error", (err) => {
			console.error(err);
		});

	done();
});

gulp.task("files", gulp.series("files-clean", "files-update", bsReload));

gulp.task("html-update", function(done) {
	gulp.src("site/**/*.html")
		.pipe(gulp.dest(donePath.html));

	done();
});

gulp.task("html-clean", function(done) {
	gulp.src("done/**/*.html")
		.pipe(map(function(file) {
			let pathSite = "site\\";
			let pathDone = "done\\";

			fs.access(pathSite + file.relative, async (err) => {
				if (err) await del([pathDone + file.relative]);
			});
		}))
		.on("error", (err) => {
			console.error(err);
		});

	done();
});

gulp.task("html", gulp.series("html-clean", "html-update"));

gulp.task("fonts-convert", function(done) {
	gulp.src("site/fonts/**/*.ttf")
		.pipe(convertFont())
		.on("error", (err) => {
			console.error(err);
		})
		.pipe(gulp.dest(donePath.fonts));

	done();
});

gulp.task("fonts-clean", function(done) {
	gulp.src("done/fonts/**/*")
		.pipe(map((file) => {
			let pathTTF = "site\\fonts\\";
			let pathWOFF = "done\\fonts\\";
			let fileTTF = file.relative.replace(file.extname, "") + ".ttf";
			let type = "";

			if (file.relative.endsWith(".woff2")) type = pathTTF + fileTTF;
			else type = pathTTF + file.relative;

			fs.access(type, async (err) => {
				if (err) await del([pathWOFF + file.relative]);
			});
		}))
		.on("error", (err) => {
			console.error(err);
		});

	done();
});

gulp.task("fonts", gulp.series("fonts-clean", "fonts-convert", bsReload));

gulp.task("watch", function() {
	gulp.watch("site/sass/**/*.sass", gulp.parallel("styles"));
	gulp.watch("site/js/**/*.js", gulp.parallel("scripts"));
	gulp.watch("site/**/*.html", gulp.parallel("html"));
	gulp.watch("site/**/*.*", gulp.parallel("files"));
	gulp.watch("site/img/**/*", gulp.parallel("images"));
	gulp.watch("site/fonts/**/*.ttf", gulp.parallel("fonts"));
})

gulp.task("default", gulp.parallel("images", "styles", "scripts", "fonts", "browser-sync", "watch"));