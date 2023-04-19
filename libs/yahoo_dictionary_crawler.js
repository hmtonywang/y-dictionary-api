'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const URI = 'https://tw.dictionary.search.yahoo.com/search?p=';

const load = async (url) => {
  const res = await axios.get(url);
  return cheerio.load(res.data);
};

module.exports = async (str) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Yahoo dictionary crawler requires a string but got a ${typeof str}`);
  }
  const trim = str.replace(/\s/g, '');
  if (!trim) {
    throw new RangeError('Yahoo dictionary crawler requires a non-empty string');
  }
  const src = `${URI}${str}`;
  const $ = await load(src);

  const getData = () => {
    const notFoundText = $('.searchCenterTop > .first > .cardDesign > .compTitle > .title').text();
    if (notFoundText.indexOf('很抱歉，字典找不到您要的資料喔') > -1) {
      return 'Not Found';
    }
    // main
    const mTitle = $('.cardDesign.dictionaryWordCard > .grp-main > .compTitle > .title > span').text();
    const phoneticElems = $('.cardDesign.dictionaryWordCard > .grp-main > .compList.d-ib > ul > li > span');
    const phonetic = [];
    for (const phoneticElem of phoneticElems) {
      phonetic.push($(phoneticElem).text());
    }
    const mPronunciationElems = $('.cardDesign.dictionaryWordCard > .grp-main > .compText > p > .fz-13');
    const mPronunciations = [];
    for (const mPronunciationElem of mPronunciationElems) {
      mPronunciations.push({
        text: $(mPronunciationElem).text()
      });
    }
    const mExplanationElems = $('.cardDesign.dictionaryWordCard > .grp-main > .compList.p-rel > ul > li');
    const mExplanations = [];
    for (const elem of mExplanationElems) {
      mExplanations.push({
        pos: $(elem).find('.pos_button').text(),
        explanation: $(elem).find('.dictionaryExplanation').text()
      });
    }
    const main = {
      title: mTitle,
      phonetic,
      pronunciations: mPronunciations,
      explanations: mExplanations
    };
    // note
    const notes = [];
    const noteElems = $('.cardDesign.dictionaryWordCard > ul.compArticleList > li > h4 > span');
    for (const noteElem of noteElems) {
      notes.push($(noteElem).text());
    }
    // secondary
    const secondaryElem = $('.cardDesign.sys_dict_tabs_card');
    const secondary = getTabsCardData(secondaryElem);
    // more
    const moreElem = $('.cardDesign.sys_dict_disambiguation');
    const more = getTabsCardData(moreElem);
    return {
      main,
      notes,
      secondary,
      more
    };
  };

  const getTabsCardData = (tabsCardElem) => {
    const tabs = [];
    const layoutTopElems = $(tabsCardElem).find('.layoutTop > .compTabsControl > ul.tab-control > li');
    for (const layoutTopElem of layoutTopElems) {
      const target = $(layoutTopElem).attr('data-target');
      const tab = {
        name: $(layoutTopElem).text(),
        target
      };
      const tabContentElem = $(tabsCardElem).find(`.layoutCenter > .grp.${target}`);
      tab.rows = getTabContentRows(tabContentElem);
      tabs.push(tab);
    }
    return tabs;
  };

  const getTabContentRows = (tabContentElem) => {
    const rows = [];
    const rowElems = $(tabContentElem).find('.compTitle:not(.lh-20), .compTextList, .compDlink, .compList, .compText');
    for (const rowElem of rowElems) {
      const isTitle = $(rowElem).hasClass('compTitle');
      const isContent = $(rowElem).hasClass('compTextList');
      const isLink = $(rowElem).hasClass('compDlink');
      const isPhonetic = $(rowElem).hasClass('compList');
      const isPronunciation = $(rowElem).hasClass('compText');
      let row;
      if (isTitle) {
        const titleLabel = $(rowElem).find('label > span.pos_button').text();
        const titleText = $(rowElem).find('h3.title').text();
        const titleHref = $(rowElem).find('h3.title > a').attr('href');
        row = {
          type: 'title',
          label: titleLabel || undefined,
          text: titleText,
          href: titleHref || undefined
        };
      } else if (isContent) {
        const contentElems = $(rowElem).find('ul > li');
        const rows = [];
        for (const contentElem of contentElems) {
          const contentPos = $(contentElem).find('.pos_button').text();
          const contentExplanation = $(contentElem).find('.d-i').text();
          const contentExampleElems = $(contentElem).find('.d-b:not(.fw-xl)');
          const contentExamples = [];
          for (const contentExampleElem of contentExampleElems) {
            contentExamples.push($(contentExampleElem).text());
          }
          rows.push({
            pos: contentPos || undefined,
            explanation: contentExplanation,
            examples: contentExamples
          });
        }
        row = { type: 'content', rows };
      } else if (isLink) {
        const rows = [];
        const linkElems = $(rowElem).find('ul > li > span.txt > a');
        for (const linkElem of linkElems) {
          rows.push({
            text: $(linkElem).text(),
            href: $(linkElem).attr('href')
          });
        }
        row = { type: 'link', rows };
      } else if (isPhonetic) {
        const rows = [];
        const phoneticElems = $(rowElem).find('ul > li > span');
        for (const phoneticElem of phoneticElems) {
          rows.push($(phoneticElem).text());
        }
        row = { type: 'phonetic', rows };
      } else if (isPronunciation) {
        row = {
          type: 'pronunciation',
          text: $(rowElem).find('p > .fz-13').text()
        };
      }
      if (row) {
        rows.push(row);
      }
    }
    return rows;
  };

  return {
    getData: () => getData(),
    get$: () => $
  };
};
