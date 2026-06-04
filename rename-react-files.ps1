Get-ChildItem -Recurse -Filter *.js | ForEach-Object {
    git mv $_.FullName ($_.FullName -replace '\.js$', '.ts')
}
Get-ChildItem -Recurse -Filter *.jsx | ForEach-Object {
    git mv $_.FullName ($_.FullName -replace '\.jsx$', '.tsx')
}
