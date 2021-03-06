## Usage
 
### To create a database in Neo4j you need to do the following:

1. Copy all your csv files from the relational database in the import folder of your Neo4j project. 
 
2. Open your project in Neo4j.
 
3. Import the Publication nodes:

```
python3 neo4j_Publications.py
```

4. Import the InferedTools tables and keywords nodes and relationships:

```
python3 neo4j_infertools_key.py
```

5. Import the Metacitation table:

```
python3 neo4j_metacitations.py
```

6. Apply clustering and the centrality algorithm with the Graph Data Science library:

```
python3 data_science.py
```

Sometimes, if there are a huge amount of edges, you need to increase the `dbms.memory.heap.max_size` size of your Neo4j project.

