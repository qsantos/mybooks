# MyBooks

[My Library](https://play.google.com/store/apps/details?id=com.vgm.mylibrary) (“Ma Bibliothèque” in French) is an Android app that lets you catalog your books and other media.
This project uses the XLS export to generate a client-side only app to visualize and share this list.
The result is a web page that allows the user to browser your owned and wished books easily.

Have a look at the [live example](https://mybooks.qsantos.fr/).
Note that I selected these books for the sake of example, this is not my actual list of books.

# Installation Instructions

```
pip3 install pandas xlrd
./export-book-wishlist >src/books.json
npm ci
npm run build
x-www-browser build/index.html
```

You can then host the `build/` directory on a web server to let other people access your library.
