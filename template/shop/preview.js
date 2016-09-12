var listColClassName = {
        1:'mui-col-xs-12',
        2:'mui-col-xs-6',
        3:'mui-col-xs-4',
        4:'mui-col-xs-3'
    };

var compIdx = 10;
var dynIdx = 0;
var listPageSize = 20;

$(function(){
    initPage(pageData);
    $('body').on('tap','.clickEvent',function(e){
        e.stopPropagation();
        var self = $(this);
        var comp = self;
        do{
            if(comp.is('.comp')){
                var linktype = comp.attr('data-linktype');
                var linksubtype = comp.attr('data-linksubtype');
                var linksubtype2 = comp.attr('data-linksubtype2');
                var link = comp.attr('data-link');
                if(linktype=='page'){ 
                    if(linksubtype == 'custom'){
                        var href = pageLinks[linksubtype2];
                        console.log(href);
                        if(href){
                            window.location.href = href;
                        }
                    }else if(linksubtype == 'prev'){
                        window.history.go(-1);
                    }else if(linksubtype == 'next'){
                        window.history.go(1);
                    }else if(linksubtype == 'url'){
                        window.location.href = link;
                    }
                }else if(linktype=='menu'){
                    if(linksubtype == 'menu_l'){
                        mui('.mui-off-canvas-wrap').offCanvas().show('left');
                    }else if(linksubtype == 'menu_r'){
                        mui('.mui-off-canvas-wrap').offCanvas().show('right');
                    }
                }else if(linktype=='menu_close'){
                    mui('.mui-off-canvas-wrap').offCanvas().close('left');
                    mui('.mui-off-canvas-wrap').offCanvas().close('right');
                }else if(linktype=='form'){
                    alert('预览模式暂不支持提交表单！');
                }
                var activeEles = self;
                if(comp.is('.comp_text')){
                    activeEles = comp.find('.clickEvent');
                }
                activeEles.addClass('active');
                setTimeout(function(){
                    activeEles.removeClass('active');
                },100);
                break;
            }
            comp = comp.parent();
        }while(!comp.is('[id^=root_]'))
    });
    
    for(var i=0;i<selectData.length;i++){
        var d = selectData[i],
            id = d.id,
            data = d.data;
        var popPicker = new mui.PopPicker();
        var options = data.options,
            selectedIdx = data.selectedIdx;
        selectedIdx = selectedIdx?selectedIdx:0;
        var optArry = [];
        for(var j=0;j<options.length;j++){
            optArry.push({value: j,text: options[j].name});
        } 
        //创建对象，并设置数据
        popPicker.setData(optArry);
        //显示选择器，并获取选中值
        var pickerBtn = $('#'+id+' .muix-select')[0];
        pickerBtn.addEventListener('tap', function(event) {
            popPicker.show(function(items) {
                pickerBtn.innerHTML = items[0].text;
            });
        }, false);
        //设置默认选中项
        popPicker.pickers[0].setSelectedIndex(selectedIdx);
    } 
    
    var sliders = $('.mui-slider');
    for(var i=0;i<sliders.length;i++){
        var slider = sliders.eq(i);
        var autoplay = slider.is('.muix-slider-autoplay');
        var opts = {};
        if(autoplay){
            var interval = slider.attr('data-interval');
            opts['interval'] = interval*1000;
        }
        mui(slider[0]).slider(opts);
    }
    
    var infiniteLists = $('.comp_list[data-infinite]');
    if(infiniteLists.length>0){
        var infiniteList = infiniteLists.eq(infiniteLists.length-1);
        /*var t = infiniteList.offset().top,
            h = infiniteList.height(),
            pageH = $(window).height();
        console.log(t,h,t+h,pageH);
        if(t+h>pageH){
            
        }*/
        var endOfPage = true;
        var obj = infiniteList;
        var cnt = 10;
        while(obj && !obj.is('[id^=root_]')){
            if(obj.is('.comp')){
                var container = obj.parent();
                var siblings = container.children('.comp');
                if(siblings.index(obj) < siblings.length-1){
                    endOfPage = false;
                    break;
                }
            }
            obj = obj.parent();
            cnt--;
            if(cnt<=0){
                break;
            }
        }
        if(endOfPage){
            pullRefreshScroll = mui($('#root_0').parent()[0]).pullToRefresh({
                up: {
					contentdown: '',
					contentrefresh: '<span class="mui-spinner"></span>',
                    callback: function() {
                        var type = infiniteList.attr('data-srctype');
                        var subtype = infiniteList.attr('data-srcsubtype');
                        var customData = {id:infiniteList.attr('id')};
                        AJAXRequestData(requestDataAppendSuc,requestDataAppendFail,type,subtype,infiniteList.find('.muix-col').length,listPageSize,customData);
                        /*var self = this;
                        setTimeout(function() { 
                            infiniteList.append('<div class="mui-row"><div class="muix-col mui-col-xs-12"><div class="container">fff</div></div></div>');
                            self.endPullUpToRefresh();
                        }, 10000000);*/
                    }
                }
            });
        }
        
    }
    
    var lists = $('.comp_list');
    for(var i=0;i<lists.length;i++){
        var list = lists.eq(i);
        var type = list.attr('data-srctype');
        var subtype = list.attr('data-srcsubtype');
        var listId = list.attr('id');
        var customData = {id:listId};
        listDataReqing[listId] = 0;
        AJAXRequestData(requestDataSuc,requestDataFail,type,subtype,0,list.find('.muix-col').length,customData);
    }
    setTimeout(function(){
        for(key in listDataReqing){
            var done = listDataReqing[key];
            if(!done){
                listShowFailInfo(key);
            }
        }
    },4000);
});

var pullRefreshScroll;

function requestDataAppendSuc(d){
    console.log(111,d);
    var customData = d.customData;
    var listId = customData.id;
    var list = $('#'+listId);
    pullRefreshScroll.endPullUpToRefresh();
    var data = d.data;
    var len = data.length;
    if(len>0){
        listAppendCols(list,data);
    }
}
function requestDataAppendFail(d){
    console.log(222,d);
    pullRefreshScroll.endPullUpToRefresh();
}
var listDataReqing = {};
function requestDataSuc(d){
    console.log(111,d);
    var customData = d.customData;
    var listId = customData.id;
    listDataReqing[listId] = 1;
    var list = $('#'+listId);
    list.find(' .compDataLoading').addClass('none');
    var data = d.data;
    var len = data.length;
    if(len>0){
        updateSrcfield(list.children('.mui-row').eq(0),data,list);
        var noDataContainers = list.find('.fieldNoData');
        for(var i=0;i<noDataContainers.length;i++){
            noDataContainers.eq(i).parent().remove();
        }
        var rows = list.children('.mui-row');
        for(var i=0;i<rows.length;i++){
            var row = rows.eq(i);
            if(row.find('.muix-col').length<=0){
                row.remove();
            }
        }
    }else{
        list.find(' .compTipsInfo').removeClass('none');
    }
}
function requestDataFail(d){
    console.log(222,d);
    var customData = d.customData;
    var listId = customData.id;
    listDataReqing[listId] = 1;
    listShowFailInfo(listId);
}
function listShowFailInfo(listId){
    $('#'+listId+' .compDataLoading').addClass('none');
    $('#'+listId+' .compTipsInfo').removeClass('none');
}
function listAppendCols(list,data){
    var row1 = list.children('.mui-row').eq(0),
        col1 = row1.children('.muix-col').eq(0),
        colType,
        startIdx = list.find('.muix-col').length;
    if(col1.is('.mui-col-xs-12')){
        colType = 1;
    }else if(col1.is('.mui-col-xs-6')){
        colType = 2;
    }else if(col1.is('.mui-col-xs-4')){
        colType = 3;
    }else if(col1.is('.mui-col-xs-3')){
        colType = 4;
    }
    for(var i=0; i<data.length;i++){
        var newCol = col1.clone();
        newCol.children('.container').addClass('fieldNoData');
        var lastRow = list.children('.mui-row').last(),
            colCnt = lastRow.children('.muix-col').length;
        if(colCnt < colType){
            lastRow.append(newCol);
        }else{
            var newRow =  row1.clone().empty();
            lastRow.after(newRow);
            newRow.append(newCol);
        }
    }
    updateSrcfield(list.children('.mui-row').eq(0),data,list,startIdx);
}

function updateSrcfield(comp,dataSrc,list,startIdx){
    var comps = comp.find('[data-srcfield]');
    if(comp.is('[data-srcfield]')){
        comps = $.merge(comps,comp);
    }
    if(comps.length==0){
        return;
    }
    var sIdx = startIdx?startIdx:0;
    comps.each(function(i,cp){
        var obj = $(cp),
        fieldName = obj.attr('data-srcfield'),
        idx = obj.attr('data-dynidx'),
        arry = list.find('[data-dynidx="'+idx+'"]');
        var dataIdx = 0;
        arry.each(function(j,ele){
            if(j>=sIdx){
                var onePiece = dataSrc[dataIdx++];
                var colContent = list.find('.muix-col').eq(j).children('.container');
                if(onePiece){
                    colContent.removeClass('fieldNoData');
                    var content = onePiece[fieldName];
                    if(obj.is('.comp_text')){
                        var wrap = $(ele).find('.muix-text');
                        wrap.html(window.parent.textGetHtml(content,wrap[0]));
                    }else if(obj.is('.comp_image')){
                        $(ele).find('img')[0].src = content;
                    }
                }else{
                    colContent.addClass('fieldNoData');
                }
            }
        }); 
    });
}

function initPage(data) {
    var body = $('#root_0').empty(),
        header = $('#root_1').empty(),
        footer = $('#root_4').empty(),
        lMenu = $('#root_2').empty(),
        rMenu = $('#root_3').empty(),
        headerD = data.header,
        footerD = data.footer,
        lMenuD = data.leftmenu,
        rMenuD = data.rightmenu,
        bComps = data.children,
        hComps = headerD ? headerD.children : undefined,
        fComps = footerD?footerD.children:undefined,
        lComps = lMenuD ? lMenuD.children : undefined,
        rComps = rMenuD ? rMenuD.children : undefined;

    var initComps = function (container, comps) {
        if (!comps) {
            return;
        }
        for (var i = 0; i < comps.length; i++) {
            container.append(buildComp(comps[i]));
        }
    };
    initComps(body, bComps);
    initComps(header, hComps);
    initComps(footer,fComps);
    initComps(lMenu, lComps);
    initComps(rMenu, rComps);

    if(!(headerD && headerD.show == 0)){
        header.removeClass('none');
    }else{
        header.addClass('none');
    }
    if(footerD && footerD.show != 0){
        footer.removeClass('none');
    }else{
        footer.addClass('none');
    }
}

function buildComp(data){
    var type = data.type;
    ++compIdx;
    data.id = compIdx+'';
    var compId = type+'_'+compIdx;
    var comp = $('<div></div>').attr({'class':'comp comp_'+type,'id':compId});
    var padding = data.padding,
        width = data.width,
        height = data.height;
    if(padding){
        comp.css('padding',padding);
    }
    if(type=="div"||type=="image"||type=="icon"||type=="text"){
        var linkType = data.linkType;
        if(linkType && linkType!='none'){
            comp.attr('data-linktype',linkType);
            var linkSubtype = data.linkSubtype;
            if(linkSubtype){
                comp.attr('data-linksubtype',linkSubtype);
            }
            var linkSubtype2 = data.linkSubtype2;
            if(linkSubtype2){
                comp.attr('data-linksubtype2',linkSubtype2);
            }
            var link = data.link;
            if(link){
                comp.attr('data-link',link);
            }
        }
    }
    if(type=="text"||type=="div"||type=="image"||type=="icon"||type=="radio"||type=="checkbox"){
        var align = data.align;
        align = align?align:'center';
        comp.addClass('align-'+align);
    }
    
    if(type=="input"||type=="textarea"||type=="radioG"||type=="checkboxG"||type=="select"){
       var name = data.name,
           showName = data.showName,
           required = data.required;
           showName = (showName!=undefined)?showName:true;
           required = (required!=undefined)?required:false;
            comp.append('<div class="formeleNameWrapper'+(showName?'':' none')+'"><span class="formeleName">'+name+'</span><span class="formeleRequired'+(required?'':' none')+'">*</span></div>');
    }
    switch (type) {
    case 'grid':
        {
            var inner = $('<div class="muix-grid"></div>');
            var colsD = data.containers;
            var allEmpty = true;
            for (var i = 0; i < colsD.length; i++) {
                var colD = colsD[i];
                var col = $('<div class="muix-grid-cell container" style="width:' + colD.width + '"></div>');
                var subCompsD = colD.children;
                if(subCompsD){
                    allEmpty = false;
                    for (var j = 0; j < subCompsD.length; j++) {
                        col.append(buildComp(subCompsD[j]));
                    }
                }else{
                    col.addClass('empty');
                }
                inner.append(col);
            }
            if(allEmpty){
                inner.addClass('empty');
            }
            comp.append(inner);
            break;
        }
    case 'image':
        {
            var srcField = data.srcField;
            if(srcField){
                comp.attr({'data-srcfield':srcField});
            }
            var inner_img = $('<img src="' + data.src + '" draggable="false">');
            var linkType = data.linkType;
            if(linkType && linkType!='none'){
                inner_img.addClass('clickEvent');
            }
            if(width){
                inner_img.css('width',width);
            }
            if(height){
                inner_img.css('height',height);
            }
            comp.append(inner_img);
            var inner_desc = $('<div class="imageDesc mui-ellipsis"></div>');
            var desc = data.desc;
            if (desc) {
                inner_desc.html(desc);
            }else{
                inner_desc.addClass('none');
            }
            comp.append(inner_desc);
            break;
        }
    case 'text':
        {
            var inner = $('<div class="muix-text"></div>');
            var html = data.html;
            inner.html(html);
            var linkType = data.linkType;
            if(linkType && linkType!='none'){
                var addEventClass = function(node){
                    if(node.nodeType == 1){
                        var children = node.childNodes;
                        for(var i=0;i<children.length;i++){
                            var child = children[i];
                            if(child.nodeType == 1){
                                addEventClass(child);
                            }else if(child.nodeType == 3){
                                var spanChild = $('<span class="clickEvent">'+child.nodeValue+'</span>')[0];
                                node.insertBefore(spanChild,child);
                                node.removeChild(child);
                            }
                        }
                    }
                }
                addEventClass(inner[0]);
            }
            var isPagename = data.ispagename;
            if(isPagename){
                comp.attr({'data-ispagename':'true'});
            }
            var srcField = data.srcField;
            if(srcField){
                comp.attr({'data-srcfield':srcField});
            }
            var lineHeight = data.lineHeight;
            lineHeight = lineHeight==undefined?'1':lineHeight;
            inner.css('line-height',lineHeight);
            comp.append(inner);
            break;
        }
    case 'icon':
        {   
            var inner = $('<div class="mui-icon"></div>');
            var linkType = data.linkType;
            if(linkType && linkType!='none'){
                inner.addClass('clickEvent');
            }
            var shape = data.shape;
            var size = data.size;
            var color = data.color;
            
            shape = shape?shape:'star';
            size = size?size:'24px';
            color = color?color:'#333';
            
            inner.addClass('mui-icon-'+shape);
            inner.css({'font-size':size,'width':size,'height':size,'color':color});
            comp.append(inner);
            break;
        }
    case 'div':
        {
            var inner = $('<div class="muix-div container"></div>');
            var linkType = data.linkType;
            if(linkType && linkType!='none'){
                inner.addClass('clickEvent');
                inner.append('<div class="clickEffect"></div>');
            }
            if(width){
                inner.css('width',width);
            }
            if(height){
                inner.css({'height':height,'min-height':height});
            }
            var borderT = data.borderT,
                borderR = data.borderR,
                borderB = data.borderB,
                borderL = data.borderL,
                radius = data.radius,
                bgColor = data.bgColor;
            if(borderT){
                inner.css('border-top',borderT);
            }
            if(borderR){
                inner.css('border-right',borderR);
            }
            if(borderB){
                inner.css('border-bottom',borderB);
            }
            if(borderL){
                inner.css('border-left',borderL);
            }
            if(radius){
                inner.css('border-radius',radius);
                if(linkType && linkType!='none'){
                    inner.children('.clickEffect').css('border-radius',radius);
                }
            }
            if(bgColor){
                inner.css('background-color',bgColor);
            }
            var children = data.children;
            if(children){
                for(var i=0;i<children.length;i++){
                    inner.append(buildComp(children[i]));
                }
            }else{
                inner.addClass('empty');
            }
            comp.append(inner);
            break;
        }
    case 'slider':
        {
            /*
            <div class="mui-slider muix-slider-autoplay">
                <div class="mui-slider-group mui-slider-loop">
                    <!-- 循环轮播模式时，需要在头和尾额外各增加的一个节点 -->
                    <div class="mui-slider-item mui-slider-item-duplicate">
                        <a>
                            <img class="demoImg" style="width:100%;height:120px" />
                            <p class="mui-slider-title">Color of SIP CBD</p>
                        </a>
                    </div>
                    <div class="mui-slider-item">
                        <a>
                            <img class="demoImg" style="width:100%;height:120px" />
                            <p class="mui-slider-title">想要这样一间小木屋</p>
                        </a>
                    </div>
                    <div class="mui-slider-item">
                        <a>
                            <img class="demoImg" style="width:100%;height:120px" />
                            <p class="mui-slider-title">静静的喝咖啡</p>
                        </a>
                    </div>
                    <div class="mui-slider-item">
                        <a>
                            <img class="demoImg" style="width:100%;height:120px" />
                            <p class="mui-slider-title">Color of SIP CBD</p>
                        </a>
                    </div>
                    <!-- 循环轮播模式时，需要在头和尾额外各增加的一个节点 -->
                    <div class="mui-slider-item mui-slider-item-duplicate">
                        <a>
                            <img class="demoImg" style="width:100%;height:120px" />
                            <p class="mui-slider-title">想要这样一间小木屋</p>
                        </a>
                    </div>
                </div>
                <div class="mui-slider-indicator mui-text-right">
                    <div class="mui-indicator mui-active"></div>
                    <div class="mui-indicator"></div>
                    <div class="mui-indicator"></div>
                </div>
            </div>                       
            */
            var indicator = data.indicator;
            var activePage = data.activePage;
            var autoplay = data.autoplay;
            var containers = data.containers;
            
            indicator = indicator?indicator:'center';
            activePage = activePage?activePage:0;
            var len = containers.length;
            activePage = activePage>len?(len-1):activePage;
            
            var inner_main = $('<div class="mui-slider"></div>');
            var inner_group = $('<div class="mui-slider-group"></div>');
            var inner_indicator = $('<div class="mui-slider-indicator"></div>');
            if(indicator=='none'){
                inner_indicator.addClass('none');
            }else if(indicator=='right'){
                inner_indicator.addClass('right');
            }
            
            for(var i=0;i<len;i++){
                var item = $('<div class="mui-slider-item container"></div>');
                var indicatorObj = $('<div class="mui-indicator"></div>');
                var children = containers[i].children;
                if(children){
                    for(var j=0;j<children.length;j++){
                        item.append(buildComp(children[j]));
                    }
                }else{
                    item.addClass('empty');
                }
                if(i==activePage){
                    indicatorObj.addClass('mui-active');
                }
                inner_group.append(item);
                inner_indicator.append(indicatorObj);
            }
            
            inner_main.append(inner_group);
            if(autoplay){
                var items = inner_group.find('.mui-slider-item');
                var itemFirstCopy = items.eq(0).clone().addClass('mui-slider-item-duplicate');
                var itemLastCopy = items.eq(items.length-1).clone().addClass('mui-slider-item-duplicate');
                inner_group.prepend(itemLastCopy).append(itemFirstCopy).addClass('mui-slider-loop');
                inner_main.addClass('muix-slider-autoplay').attr('data-interval',autoplay);
            }
            if(inner_indicator){
                inner_main.append(inner_indicator);
            }
            comp.append(inner_main);
            break;
        }
    case 'list':
        {
            var rowCnt = data.rowCnt;
            var colCnt = data.colCnt;
            var srcType = data.srcType;
            var srcSubtype = data.srcSubtype;
            var infinite = data.infinite;
            srcType = srcType?srcType:'product';
            srcSubtype = srcSubtype?srcSubtype:'0';
            comp.attr('data-rowcnt',rowCnt = rowCnt?rowCnt:3);
            comp.attr('data-colcnt',colCnt = colCnt?colCnt:1);
            comp.attr('data-srctype',srcType);
            comp.attr('data-srcsubtype',srcSubtype);
            if(infinite){
                comp.attr('data-infinite',infinite);
            }
            
            var col = $('<div class="muix-col"></div>').addClass(listColClassName[colCnt]);
            var container = $('<div class="container"></div>');
            var children = data.children;
            if(children){
                for(var i=0;i<children.length;i++){
                    container.append(addListInfo(buildComp(children[i]),compId));
                }
            }else{
                col.addClass('empty');
                container.addClass('empty');
            }
            col.append(container);
            var row = $('<div class="mui-row"></div>');
            for(var i=0;i<colCnt;i++){
                row.append(col.clone());
            }
            for(var i=0;i<rowCnt;i++){
                comp.append(row.clone());
            }
            comp.append('<div class="compTipsMask compDataLoading"><div class="compDataLoadingInner"><span class="mui-spinner"></span></div></div>').append('<div class="compTipsMask compTipsInfo none"><div class="compTipsInfoInner">暂无数据</div></div>');
            break;
        }
    case 'form':
        {
            var inner = $('<form></form>');
            var children = data.children,
                showName = data.showName,
                showBtn = data.showBtn,
                name = data.name;
            showName = (showName!=undefined)?showName:true;
            showBtn = (showBtn!=undefined)?showBtn:true;
            var nameEle = $('<div class="form_name">'+name+'</div>');
            if(!showName){
                nameEle.addClass('none');
            }
            inner.append(nameEle);
            var body = $('<div class="form_body container"></div>');
            if(children){
                for(var j=0;j<children.length;j++){
                    var child = buildComp(children[j]);
                        child.attr('data-formid',compId);
                    body.append(child);
                }
            }else{
                body.addClass('empty');
            }
            inner.append(body);
            var btn = $('<div class="form_btn"><button>提 交</button></div>');
            if(!showBtn){
                btn.addClass('none');
            }
            inner.append(btn);
            comp.append(inner);
            break;
        }
    case 'input':
        {
            var placeHolder = data.placeHolder;
            comp.append('<input type="text" '+(placeHolder?'placeholder="'+placeHolder+'"':'')+' />');
            break;
        }
    case 'textarea':
        {
            var placeHolder = data.placeHolder,
                rows = data.rows;
            comp.append('<textarea id="textarea" rows="'+(rows?rows:'5')+'" '+(placeHolder?'placeholder="'+placeHolder+'"':'')+'></textarea>');
            break;
        }
    case 'radioG':
        {
            var inner = $('<div class="group_body container"></div>');
            var children = data.children;
            for(var j=0;j<children.length;j++){
                var child = buildComp(children[j]);
                    child.attr('data-formid',compId);
                inner.append(child);
            }
            comp.append(inner);
            comp.find('input[type=radio]').attr('name',comp.attr('id').replace('radioG_','radio_'));
            break;
        }
    case 'checkboxG':
        {
            var inner = $('<div class="group_body container"></div>');
            var children = data.children;;
            for(var j=0;j<children.length;j++){
                var child = buildComp(children[j]);
                    child.attr('data-formid',compId);
                inner.append(child);
            }
            comp.append(inner);
            break;
        }
    case 'radio':
        {
            var checked = data.checked,
                name = data.name,
                showName = data.showName;
            showName = (showName!=undefined)?showName:true;
            comp.append('<input class="muix-radio" type="radio"'+(checked?' checked':'')+' />')
                .append('<span class="label'+(showName?'':' none')+'">'+name+'</span>');
            break;
        }
    case 'checkbox':
        {
            var checked = data.checked,
                name = data.name,
                showName = data.showName;
            showName = (showName!=undefined)?showName:true;
            comp.append('<input class="muix-checkbox" type="checkbox"'+(checked?' checked':'')+' />')
                .append('<span class="label'+(showName?'':' none')+'">'+name+'</span>');
            break;
        }
    case 'select':
        {
            var options = data.options,
                selectedIdx = data.selectedIdx;
            selectedIdx = selectedIdx?selectedIdx:0;
            var selectId = 'select_'+data.id;
            var select = $('<div id="'+selectId+'" class="muix-select mui-ellipsis">'+options[selectedIdx].name+'</div>');
            selectData.push({id:selectId,data:data});
            comp.append(select);
            break;
        }
    }
    return comp;
}
var selectData = [];
function addListInfo(comp,id){
    $.merge(comp.find('.comp,.container'),comp).each(function(i,cp){
        $(cp).attr({'data-dynidx':++dynIdx,'data-listid':id});
    });
    return comp;
}