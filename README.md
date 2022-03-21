# InSoLiTo (Inferring Social Life of Tools)

The aim of this Master's thesis project is to create a graph-based network of the co-usage, understood as being cited by the same scientific publication, of research software found in OpenEBench.

Currently, there are two type of databases used to create this social network of tools:

- [Metadata database](MetaGraph): Creation of a relational and graph database for all the metadata information of the research papers.

- [OpenAccess database](OpenAccessGraph): Creation of a relational and graph database for each of the publications sections (Introduction, Methods, Results, Discussion) information of the OpenAccess research papers.

Also, there is the [MetaOAGraph folder](MetaOAGraph), used to merge the Metadata and OpenAccess database for further analysis. You can also create a graph database with the merged database with all the use cases together.

The scripts used for analysing the graph database are in the [Graph Analysis](GraphAnalysis) folder.

The HTML files and script used to visualise the graph are in the [Visualisation](Visualisation) folder.

### Main requirement

Before creating the databases you need a Publications domain from your tools of interest. The Publications domain can be computed with the [OpenEBench references and citations enricher](https://github.com/inab/opeb-enrichers/tree/master/pubEnricher).

### Archived Repository

The repository is archived because it has the implementation used for the Master thesis project for the Master in Innovation and Research in Informatics from the Universitat Politècnica de Catalunya (UPC), with Data Science as specialization. The full thesis project can be read [here](https://upcommons.upc.edu/handle/2117/356877).

In order to follow the current work of the InSoLiTo project, go to this [repository](https://github.com/inab/InSoLiTo).