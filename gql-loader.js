function splitSource(source) {
    const arrayOfLines = source.match(/[^\r\n]+/g);


    const imports = arrayOfLines.filter(line => line[0] === '#');
    const query = arrayOfLines.filter(line => line[0] !== '#');

    return [imports, query];
}

function expandImports(sources) {
    const imports = sources.map((source, idx) => {
        const filePath = source.slice(1).split(' ')[2];
        const comma = idx > 0 ? ',' : '';

        return `${comma} require(${filePath})`;
    });

    const allImports = `var frags = [${imports.join('')}];`;

    return allImports;
}

module.exports = function doshit(source) {
    const [imports, query] = splitSource(source);
    const expandedImports = expandImports(imports);

    const queryString = query.join('')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');

    const wholeThing = `${expandedImports} module.exports = \`\${frags} ${queryString}\``;
    return wholeThing;
};
