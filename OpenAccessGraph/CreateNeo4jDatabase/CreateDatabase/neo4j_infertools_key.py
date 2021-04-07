# Import libraries
from neo4j import GraphDatabase
import time

# Start time - Just to count how much the script lasts
start_time = time.time()

# URL of the Neo4j Server
uri = "bolt://localhost:7687"
# Driver to connect to the Server with the author and the password
# To be able to use it, you need to open your neo4j server before
driver = GraphDatabase.driver(uri, auth=("neo4j", "1234"))

def graph():
    with driver.session() as session:
        session.run("""MATCH ()-[r:HAS_TOOL]->() DELETE r""")
        session.run("""MATCH ()-[r:METAOCCUR]->() DELETE r""")
        session.run("""MATCH ()-[r:INPUTDATA]->() DELETE r""")
        session.run("""MATCH ()-[r:INPUTFORMAT]->() DELETE r""")
        session.run("""MATCH ()-[r:OUTPUTDATA]->() DELETE r""")
        session.run("""MATCH ()-[r:OUTPUTFORMAT]->() DELETE r""")
        session.run("""MATCH ()-[r:TOPIC]->() DELETE r""")
        session.run("""MATCH ()-[r:OPERATION]->() DELETE r""")
        
        session.run("""MATCH (r:Keyword) DELETE r""")
        session.run("""MATCH (r:InferedTool) DELETE r""")
        session.run("""DROP INDEX index_infertools IF EXISTS""")
        
        #Creating keywords nodes
        # edam: Identifier of the edam ontology
        # label: Human Readable Edam id
        print("Creating Keyword nodes")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///Keywords.csv" AS csv
            with csv.edam_id as csvedam, csv.readableID as csvreadableID
            CREATE (p:Keyword {edam: csvedam, label: csvreadableID})
            """)
        #Creating InferedTools nodes
        # Label of the edges
        print("Creating InferedTool nodes")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///InferedTools.csv" AS csv
            CREATE (p:InferedTool {name: csv.name, label: csv.label})
            """)
        
        #Creating Tool-Publications edges
        # :HAS_TOOL: Label of the edges
        print("Creating INPUTDATA edges")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///Input_data.csv" AS csv
            MATCH (t:InferedTool {name:csv.name}),(k:Keyword {edam:csv.input_data})
            CREATE (t)-[:INPUTDATA]->(k)
            """)
        #Creating Tool-Publications edges
        # :HAS_TOOL: Label of the edges
        print("Creating INPUTFORMAT edges")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///Input_format.csv" AS csv
            MATCH (t:InferedTool {name:csv.name}),(k:Keyword {edam:csv.input_format})
            CREATE (t)-[:INPUTFORMAT]->(k)
            """)
                
        #Creating Tool-Publications edges
        # :HAS_TOOL: Label of the edges
        print("Creating OUTPUTDATA edges")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///Output_data.csv" AS csv
            MATCH (t:InferedTool {name:csv.name}),(k:Keyword {edam:csv.output_data})
            CREATE (t)-[:OUTPUTDATA]->(k)
            """)        
        #Creating Tool-Publications edges
        # :HAS_TOOL: Label of the edges
        print("Creating OUTPUTFORMAT edges")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///Output_format.csv" AS csv
            MATCH (t:InferedTool {name:csv.name}),(k:Keyword {edam:csv.output_format})
            CREATE (t)-[:OUTPUTFORMAT]->(k)
            """)        
        #Creating Tool-Publications edges
        # :HAS_TOOL: Label of the edges
        print("Creating TOPIC edges")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///Topics.csv" AS csv
            MATCH (t:InferedTool {name:csv.name}),(k:Keyword {edam:csv.topics})
            CREATE (t)-[:TOPIC]->(k)
            """)        
        #Creating Tool-Publications edges
        # :HAS_TOOL: Label of the edges
        print("Creating OPERATIONedges")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///Operations.csv" AS csv
            MATCH (t:InferedTool {name:csv.name}),(k:Keyword {edam:csv.operations})
            CREATE (t)-[:OPERATION]->(k)
            """)

        #Creating Tool-Publications edges
        # :HAS_TOOL: Label of the edges
        print("Creating Tool-Publication edges")
        session.run("""
            LOAD CSV WITH HEADERS FROM "file:///InferedTools_to_Publications.csv" AS csv
            MATCH (t:InferedTool {name:csv.name}),(p:Publication {id:csv.Publication_id})
            CREATE (p)-[:HAS_TOOL]->(t)
            """)


if __name__ == '__main__':
    graph()
    print("--- %s seconds ---" % (time.time() - start_time))