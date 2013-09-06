//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }
            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + ext.JSON.encode(data.in) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var checkioInput = data.in;
            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + ext.JSON.encode(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + ext.JSON.encode(checkioInput) + ')');
                $content.find('.answer').html(result_addon);
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + ext.JSON.encode(checkioInput) + ')');
                $content.find('.answer').remove();
            }

            var canvas = new SapperCanvas($content.find(".explanation")[0]);
            canvas.createCanvas(data.ext["input"]);
            if (!result) {
                canvas.showMine(data.ext["mine_map"]);
            }


            this_e.setAnimationHeight($content.height() + 60);

        });

        var colorOrange4 = "#F0801A";
        var colorOrange3 = "#FA8F00";
        var colorOrange2 = "#FAA600";
        var colorOrange1 = "#FABA00";

        var colorBlue4 = "#294270";
        var colorBlue3 = "#006CA9";
        var colorBlue2 = "#65A1CF";
        var colorBlue1 = "#8FC7ED";

        var colorGrey4 = "#737370";
        var colorGrey3 = "#D9E9E";
        var colorGrey2 = "#C5C6C6";
        var colorGrey1 = "#EBEDED";

        var colorWhite = "#FFFFFF";

        function SapperCanvas(dom) {
            var x0 = 10,
                y0 = 10,
                cellSize = 30,
                cellN = 10;

            var uncoveredCell = {"stroke": colorGrey4, "fill": colorGrey1, "stroke-width": 2};
            var mineCell = {"stroke": colorGrey4, "fill": colorOrange1, "stroke-width": 2};
            var openedCell = {"stroke": colorGrey4, "fill": colorBlue1, "stroke-width": 2};
            var attrNumb = {"stroke": colorBlue4, "font-size": cellSize * 0.6, "font-family": "verdana"};
            var attrSign = {"stroke": colorBlue3, "font-size": cellSize * 0.5, "font-family": "verdana"};
            var attrMine = {"stroke": colorOrange4, "fill": colorOrange4, "font-size": cellSize * 0.6, "font-family": "verdana"};


            var fullSize = 4 * x0 + cellN * cellSize;

            var paper = Raphael(dom, fullSize, fullSize, 0, 0);
            var fieldSet = paper.set();

            this.createCanvas = function (inputMap) {
                for (var row = 0; row < cellN; row++) {
                    paper.text(3 * x0 + row * cellSize + cellSize / 2,
                        fullSize - 4 * y0 - cellN * cellSize + cellSize / 2,
                        String(row + 1)
                    ).attr(attrSign);
                    paper.text(cellSize / 2,
                        fullSize - y0 - (cellN - row) * cellSize + cellSize / 2,
                        String(row + 1)
                    ).attr(attrSign);
                    var rowSet = paper.set();
                    for (var col = 0; col < cellN; col++) {
                        var r = paper.rect(
                            3 * x0 + col * cellSize,
                            fullSize - y0 - (cellN - row) * cellSize,
                            cellSize,
                            cellSize
                        );
                        if (inputMap[row][col] === -1) {
                            r.attr(uncoveredCell);
                        }
                        else if (inputMap[row][col] === 9) {
                            r.attr(uncoveredCell);
                            paper.text(3 * x0 + col * cellSize + cellSize / 2,
                                fullSize - y0 - (cellN - row) * cellSize + cellSize / 2,
                                "X"
                            ).attr(attrMine);
                        }
                        else {
                            r.attr(openedCell);
                            if (inputMap[row][col] !== 0) {
                                paper.text(3 * x0 + col * cellSize + cellSize / 2,
                                    fullSize - y0 - (cellN - row) * cellSize + cellSize / 2,
                                    inputMap[row][col]
                                ).attr(attrNumb);
                            }
                        }
                        rowSet.push(r);
                    }
                    fieldSet.push(rowSet);
                }
            };

            this.showMine = function (mineMap) {
                for (var row = 0; row < cellN; row++) {
                    for (var col = 0; col < cellN; col++) {
                        if (mineMap[row][col]) {
                            fieldSet[row][col].attr(mineCell);
                        }
                    }
                }
            }
        }


        //Your Additional functions or objects inside scope
        //
        //
        //


    }
);
